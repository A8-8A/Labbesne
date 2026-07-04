package com.labbesne.repository;

import com.labbesne.entity.Transaction;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);
    Page<Transaction> findByStoreIdOrderByCreatedAtDesc(Long storeId, Pageable pageable);
}
