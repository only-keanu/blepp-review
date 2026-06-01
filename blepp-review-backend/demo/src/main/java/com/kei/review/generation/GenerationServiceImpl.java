package com.kei.review.generation;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kei.review.generation.dto.GeneratedQuestionResponse;
import com.kei.review.generation.dto.GenerationRunRequest;
import com.kei.review.generation.dto.GenerationRunResponse;
import com.kei.review.generation.dto.GenerationStatusResponse;
import com.kei.review.generation.dto.GenerationUploadResponse;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GenerationServiceImpl implements GenerationService {
    private static final int DEFAULT_QUESTION_COUNT = 10;
    private static final int MAX_QUESTION_COUNT = 50;
    private static final int MAX_PDF_CHARS = 12000;

    private final GenerationJobRepository jobRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    private final String uploadDir;
    private final String openAiApiKey;
    private final String defaultModel;
    private final long maxPdfBytes;

    public GenerationServiceImpl(
        GenerationJobRepository jobRepository,
        UserRepository userRepository,
        @Value("${app.generation.upload-dir:uploads/generation}") String uploadDir,
        @Value("${app.openai.api-key:}") String openAiApiKey,
        @Value("${app.openai.model:gpt-4o-mini}") String defaultModel,
        @Value("${app.generation.max-pdf-bytes:10485760}") long maxPdfBytes
    ) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.uploadDir = uploadDir;
        this.openAiApiKey = openAiApiKey;
        this.defaultModel = defaultModel;
        this.maxPdfBytes = maxPdfBytes;
    }

    @Override
    public GenerationUploadResponse upload(UUID userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF file is required.");
        }
        if (file.getSize() > maxPdfBytes) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF file exceeds the configured size limit.");
        }

        String originalFilename = Optional.ofNullable(file.getOriginalFilename()).orElse("");
        String contentType = Optional.ofNullable(file.getContentType()).orElse("");
        if (!contentType.equalsIgnoreCase("application/pdf")
            && !originalFilename.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are supported.");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        Path baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(baseDir);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to prepare upload directory.");
        }

        String storedName = UUID.randomUUID() + ".pdf";
        Path targetPath = baseDir.resolve(storedName);
        try {
            file.transferTo(targetPath);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store PDF file.");
        }

        GenerationJob job = GenerationJob.builder()
            .user(user)
            .uploadPath(targetPath.toString())
            .status(GenerationStatus.PENDING)
            .createdAt(Instant.now())
            .build();

        GenerationJob saved = jobRepository.save(job);
        return new GenerationUploadResponse(saved.getId());
    }

    @Override
    public GenerationRunResponse run(UUID userId, GenerationRunRequest request) {
        if (request == null || request.uploadId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "uploadId is required.");
        }
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OpenAI API key is not configured.");
        }

        GenerationJob job = jobRepository.findById(request.uploadId())
            .filter(existing -> existing.getUser().getId().equals(userId))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Upload not found."));

        int questionCount = normalizeQuestionCount(request.questionCount());
        String model = request.model() == null || request.model().isBlank() ? defaultModel : request.model();

        job.setStatus(GenerationStatus.RUNNING);
        job.setModel(model);
        job.setQuestionCount(questionCount);
        job.setDifficulty(blankToNull(request.difficulty()));
        job.setTopicId(request.topicId());
        job.setSourceLabel(blankToNull(request.sourceLabel()));
        job.setGeneratedQuestionsJson(null);
        job.setErrorMessage(null);
        jobRepository.save(job);

        try {
            String pdfText = loadPdfText(job.getUploadPath());
            List<GeneratedQuestionResponse> questions = callOpenAi(pdfText, questionCount, model, job);
            job.setStatus(GenerationStatus.COMPLETED);
            job.setCompletedAt(Instant.now());
            job.setGeneratedQuestionsJson(objectMapper.writeValueAsString(questions));
            jobRepository.save(job);
            return new GenerationRunResponse(job.getId(), job.getStatus(), questionCount, questions, null);
        } catch (Exception e) {
            job.setStatus(GenerationStatus.FAILED);
            job.setCompletedAt(Instant.now());
            job.setErrorMessage(e.getMessage());
            jobRepository.save(job);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate questions.");
        }
    }

    @Override
    public GenerationStatusResponse status(UUID userId, UUID jobId) {
        GenerationJob job = jobRepository.findById(jobId)
            .filter(existing -> existing.getUser().getId().equals(userId))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Generation job not found."));
        return new GenerationStatusResponse(
            job.getId(),
            job.getStatus(),
            job.getQuestionCount(),
            readGeneratedQuestions(job),
            job.getErrorMessage()
        );
    }

    private int normalizeQuestionCount(Integer requested) {
        if (requested == null) {
            return DEFAULT_QUESTION_COUNT;
        }
        return Math.max(1, Math.min(requested, MAX_QUESTION_COUNT));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String loadPdfText(String uploadPath) throws IOException {
        Path path = Paths.get(uploadPath);
        try (PDDocument document = Loader.loadPDF(path.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            if (text == null) {
                return "";
            }
            return text.length() > MAX_PDF_CHARS ? text.substring(0, MAX_PDF_CHARS) : text;
        }
    }

    private List<GeneratedQuestionResponse> callOpenAi(
        String pdfText,
        int questionCount,
        String model,
        GenerationJob job
    )
        throws IOException {
        Map<String, Object> schema = new HashMap<>();
        schema.put("type", "object");
        schema.put("additionalProperties", false);
        schema.put("required", List.of("questions"));
        schema.put("properties", Map.of(
            "questions", Map.of(
                "type", "array",
                "items", Map.of(
                    "type", "object",
                    "additionalProperties", false,
                    "required", List.of("text", "choices", "correctAnswerIndex", "explanation", "difficulty", "tags"),
                    "properties", Map.of(
                        "text", Map.of("type", "string"),
                        "choices", Map.of(
                            "type", "array",
                            "minItems", 4,
                            "maxItems", 4,
                            "items", Map.of("type", "string")
                        ),
                        "correctAnswerIndex", Map.of("type", "integer", "minimum", 0),
                        "explanation", Map.of("type", "string"),
                        "difficulty", Map.of("type", "string", "enum", List.of("easy", "medium", "hard")),
                        "tags", Map.of("type", "array", "items", Map.of("type", "string"))
                    )
                )
            )
        ));

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("input", List.of(
            Map.of(
                "role", "system",
                "content", "You generate concise multiple-choice questions from PDF notes."
            ),
            Map.of(
                "role", "user",
                "content", "Generate " + questionCount + " board-style multiple-choice questions based only on the notes below. " +
                    generationControls(job) +
                    "Each question must have exactly 4 answer choices, one correct answer index from 0 to 3, an explanation, a difficulty (easy, medium, hard), and 2-5 short tags. " +
                    "Return JSON that matches the provided schema.\n\nNotes:\n" + pdfText
            )
        ));
        body.put("text", Map.of(
            "format", Map.of(
                "type", "json_schema",
                "name", "generated_questions",
                "schema", schema,
                "strict", true
            )
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
            "https://api.openai.com/v1/responses",
            entity,
            Map.class
        );

        Map<String, Object> responseBody = response.getBody();
        if (responseBody == null) {
            throw new IOException("Empty response from OpenAI.");
        }

        String outputText = extractOutputText(responseBody);
        if (outputText == null || outputText.isBlank()) {
            throw new IOException("OpenAI response did not contain output text.");
        }

        Map<String, Object> parsed = objectMapper.readValue(outputText, new TypeReference<>() {});
        Object questions = parsed.get("questions");
        if (questions == null) {
            throw new IOException("OpenAI response missing questions.");
        }
        String questionsJson = objectMapper.writeValueAsString(questions);
        List<GeneratedQuestionResponse> results = objectMapper.readValue(
            questionsJson,
            new TypeReference<List<GeneratedQuestionResponse>>() {}
        );

        return results.stream()
            .map(this::validateQuestion)
            .toList();
    }

    private String generationControls(GenerationJob job) {
        StringBuilder controls = new StringBuilder();
        if (job.getDifficulty() != null) {
            controls.append("Use this requested difficulty for every question: ")
                .append(job.getDifficulty())
                .append(". ");
        }
        if (job.getSourceLabel() != null) {
            controls.append("Use source label context: ")
                .append(job.getSourceLabel())
                .append(". ");
        }
        return controls.toString();
    }

    private GeneratedQuestionResponse validateQuestion(GeneratedQuestionResponse question) {
        if (question.text() == null || question.text().isBlank()) {
            throw new IllegalArgumentException("Generated question text is required.");
        }
        if (question.choices() == null || question.choices().size() != 4) {
            throw new IllegalArgumentException("Generated questions must include exactly 4 choices.");
        }
        if (question.choices().stream().anyMatch(choice -> choice == null || choice.isBlank())) {
            throw new IllegalArgumentException("Generated question choices cannot be blank.");
        }
        if (question.correctAnswerIndex() == null
            || question.correctAnswerIndex() < 0
            || question.correctAnswerIndex() >= 4) {
            throw new IllegalArgumentException("Generated questions must include a valid correct answer index.");
        }
        if (question.explanation() == null || question.explanation().isBlank()) {
            throw new IllegalArgumentException("Generated question explanation is required.");
        }
        if (question.difficulty() == null || question.difficulty().isBlank()) {
            throw new IllegalArgumentException("Generated question difficulty is required.");
        }
        if (question.tags() == null || question.tags().isEmpty()) {
            throw new IllegalArgumentException("Generated question tags are required.");
        }
        return question;
    }

    private List<GeneratedQuestionResponse> readGeneratedQuestions(GenerationJob job) {
        if (job.getGeneratedQuestionsJson() == null || job.getGeneratedQuestionsJson().isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(
                job.getGeneratedQuestionsJson(),
                new TypeReference<List<GeneratedQuestionResponse>>() {}
            );
        } catch (IOException e) {
            return List.of();
        }
    }

    private String extractOutputText(Map<String, Object> responseBody) {
        Object direct = responseBody.get("output_text");
        if (direct instanceof String directText && !directText.isBlank()) {
            return directText;
        }

        Object output = responseBody.get("output");
        if (!(output instanceof List<?> outputList)) {
            return null;
        }

        StringBuilder builder = new StringBuilder();
        for (Object item : outputList) {
            if (!(item instanceof Map<?, ?> itemMap)) {
                continue;
            }
            Object content = itemMap.get("content");
            if (!(content instanceof List<?> contentList)) {
                continue;
            }
            for (Object contentItem : contentList) {
                if (!(contentItem instanceof Map<?, ?> contentMap)) {
                    continue;
                }
                Object text = contentMap.get("text");
                if (text instanceof String textValue) {
                    builder.append(textValue);
                }
            }
        }
        return builder.toString();
    }
}
