package com.kei.review.users;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);

    @Query("""
        select u from User u
        where (:query is null
            or :query = ''
            or lower(u.email) like lower(concat('%', :query, '%'))
            or lower(u.fullName) like lower(concat('%', :query, '%')))
        order by u.createdAt desc, u.email asc
        """)
    Page<User> searchUsers(
        @Param("query") String query,
        Pageable pageable
    );

    @Query("""
        select u from User u
        where (:query is null
            or :query = ''
            or lower(u.email) like lower(concat('%', :query, '%'))
            or lower(u.fullName) like lower(concat('%', :query, '%')))
            and u.accessStatus = :paidStatus
            and u.paidUntil is not null
            and u.paidUntil > :now
        order by u.createdAt desc, u.email asc
        """)
    Page<User> searchPaidUsers(
        @Param("query") String query,
        @Param("now") Instant now,
        @Param("paidStatus") UserAccessStatus paidStatus,
        Pageable pageable
    );

    @Query("""
        select u from User u
        where (:query is null
            or :query = ''
            or lower(u.email) like lower(concat('%', :query, '%'))
            or lower(u.fullName) like lower(concat('%', :query, '%')))
            and u.accessStatus = :trialStatus
            and u.trialEndsAt is not null
            and u.trialEndsAt > :now
        order by u.createdAt desc, u.email asc
        """)
    Page<User> searchTrialUsers(
        @Param("query") String query,
        @Param("now") Instant now,
        @Param("trialStatus") UserAccessStatus trialStatus,
        Pageable pageable
    );

    @Query("""
        select u from User u
        where (:query is null
            or :query = ''
            or lower(u.email) like lower(concat('%', :query, '%'))
            or lower(u.fullName) like lower(concat('%', :query, '%')))
            and (
                u.accessStatus is null
                or u.accessStatus = :expiredStatus
                or (u.accessStatus = :paidStatus and (u.paidUntil is null or u.paidUntil <= :now))
                or (u.accessStatus = :trialStatus and (u.trialEndsAt is null or u.trialEndsAt <= :now))
            )
        order by u.createdAt desc, u.email asc
        """)
    Page<User> searchExpiredUsers(
        @Param("query") String query,
        @Param("now") Instant now,
        @Param("paidStatus") UserAccessStatus paidStatus,
        @Param("trialStatus") UserAccessStatus trialStatus,
        @Param("expiredStatus") UserAccessStatus expiredStatus,
        Pageable pageable
    );
}
