package com.kei.review.generation;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GenerationJobRepository extends JpaRepository<GenerationJob, UUID> {
}
