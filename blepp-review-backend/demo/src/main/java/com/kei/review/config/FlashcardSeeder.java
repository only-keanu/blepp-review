package com.kei.review.config;

import com.kei.review.flashcards.Flashcard;
import com.kei.review.flashcards.FlashcardRepository;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(3)
public class FlashcardSeeder implements CommandLineRunner {
    private final FlashcardRepository flashcardRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public FlashcardSeeder(
        FlashcardRepository flashcardRepository,
        TopicRepository topicRepository,
        UserRepository userRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.flashcardRepository = flashcardRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        User owner = userRepository.findByEmail(SeedData.SYSTEM_USER_EMAIL)
            .orElseGet(() -> userRepository.save(User.builder()
                .email(SeedData.SYSTEM_USER_EMAIL)
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName("BLEPP Seed Content")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build()));

        Map<String, Topic> topicsBySlug = topicRepository.findAll().stream()
            .collect(Collectors.toMap(Topic::getSlug, Function.identity(), (a, b) -> a));

        flashcards().stream()
            .filter(seed -> topicsBySlug.containsKey(seed.topicSlug()))
            .filter(seed -> !flashcardRepository.existsByUserEmailAndFront(SeedData.SYSTEM_USER_EMAIL, seed.front()))
            .map(seed -> toFlashcard(owner, topicsBySlug.get(seed.topicSlug()), seed))
            .forEach(flashcardRepository::save);
    }

    private Flashcard toFlashcard(User owner, Topic topic, SeedFlashcard seed) {
        return Flashcard.builder()
            .user(owner)
            .topic(topic)
            .front(seed.front())
            .back(seed.back())
            .category(seed.category())
            .confidence(null)
            .nextReview(null)
            .createdAt(Instant.now())
            .build();
    }

    private List<SeedFlashcard> flashcards() {
        return List.of(
            f("general-psychology", "What is the independent variable?", "The condition or factor manipulated by the researcher to observe its effect on an outcome.", "Research Methods"),
            f("general-psychology", "What does reliability mean in psychological measurement?", "Reliability is the consistency or stability of a test score across items, raters, or occasions.", "Assessment Basics"),
            f("general-psychology", "What is Piaget's concrete operational stage known for?", "Children develop logical thinking about concrete events, including conservation and reversibility.", "Development"),
            f("general-psychology", "What is the fundamental attribution error?", "It is the tendency to overemphasize dispositional causes and underemphasize situational causes for others' behavior.", "Social Psychology"),
            f("general-psychology", "What is echoic memory?", "Echoic memory is the short-lived sensory memory register for auditory information.", "Cognition"),

            f("abnormal-psychology", "What is a hallucination?", "A hallucination is a sensory perception that occurs without an external stimulus.", "Psychotic Disorders"),
            f("abnormal-psychology", "What distinguishes obsessions from compulsions?", "Obsessions are intrusive thoughts or urges; compulsions are repetitive acts used to reduce distress.", "OCD"),
            f("abnormal-psychology", "What is a key feature of a panic attack?", "A panic attack is an abrupt surge of intense fear with physical arousal such as palpitations or shortness of breath.", "Anxiety Disorders"),
            f("abnormal-psychology", "What is avolition?", "Avolition is reduced motivation or goal-directed activity, commonly described as a negative symptom of schizophrenia.", "Psychotic Disorders"),
            f("abnormal-psychology", "What does CBT target?", "Cognitive-behavioral therapy targets maladaptive thoughts and behaviors through structured practice.", "Treatment"),

            f("psychological-assessment", "What is validity?", "Validity is the degree to which evidence supports the intended interpretation and use of test scores.", "Psychometrics"),
            f("psychological-assessment", "What is Cronbach's alpha used for?", "Cronbach's alpha estimates internal consistency among items intended to measure the same construct.", "Reliability"),
            f("psychological-assessment", "What does a percentile rank of 75 mean?", "It means the examinee scored higher than about 75 percent of the norm group.", "Scores and Norms"),
            f("psychological-assessment", "What is inter-rater reliability?", "Inter-rater reliability is consistency between two or more independent scorers or evaluators.", "Reliability"),
            f("psychological-assessment", "What is standard error of measurement?", "It estimates the likely range of error around an observed test score.", "Measurement Error"),

            f("industrial-organizational-psychology", "What is job analysis?", "Job analysis identifies tasks, duties, responsibilities, and required knowledge, skills, abilities, and other characteristics.", "Job Analysis"),
            f("industrial-organizational-psychology", "Why are structured interviews useful?", "They improve selection consistency by using standardized questions and scoring tied to job requirements.", "Selection"),
            f("industrial-organizational-psychology", "What is transformational leadership?", "Transformational leadership inspires followers through vision, intellectual stimulation, and individualized consideration.", "Leadership"),
            f("industrial-organizational-psychology", "What are hygiene factors in Herzberg's theory?", "Hygiene factors reduce dissatisfaction but do not by themselves create strong motivation.", "Motivation"),
            f("industrial-organizational-psychology", "What is organizational citizenship behavior?", "It is voluntary behavior that supports organizational functioning beyond formal job requirements.", "Organizational Behavior"),

            f("ethics-ra-10029", "What should informed consent generally include?", "It should explain the nature, purpose, risks, benefits, alternatives, and limits of confidentiality.", "Consent"),
            f("ethics-ra-10029", "What does competence require?", "Competence requires practice within areas supported by education, training, supervised experience, or consultation.", "Professional Competence"),
            f("ethics-ra-10029", "How should test security be protected?", "Access to test materials should be limited to qualified users and handled under secure conditions.", "Testing Ethics"),
            f("ethics-ra-10029", "What is the duty to warn or protect?", "It is an exception to confidentiality when serious imminent risk to self or others may require protective action.", "Confidentiality"),
            f("ethics-ra-10029", "What is RA 10029 associated with?", "RA 10029 is the Philippine Psychology Act regulating psychology and psychometrics practice.", "RA 10029")
        );
    }

    private SeedFlashcard f(String topicSlug, String front, String back, String category) {
        return new SeedFlashcard(topicSlug, front, back, category);
    }

    private record SeedFlashcard(String topicSlug, String front, String back, String category) {
    }
}
