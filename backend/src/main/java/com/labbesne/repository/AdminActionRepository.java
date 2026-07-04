package com.labbesne.repository;

import com.labbesne.entity.AdminAction;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminActionRepository extends JpaRepository<AdminAction, Long> {
    Page<AdminAction> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
