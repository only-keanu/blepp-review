package com.kei.review.users;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    @Query("""
        select u from User u
        where :query is null
            or :query = ''
            or lower(u.email) like lower(concat('%', :query, '%'))
            or lower(u.fullName) like lower(concat('%', :query, '%'))
        order by u.createdAt desc, u.email asc
        """)
    List<User> searchUsers(@Param("query") String query, Pageable pageable);
}
