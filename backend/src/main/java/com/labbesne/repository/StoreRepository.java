package com.labbesne.repository;

import com.labbesne.entity.Store;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByOwnerId(Long ownerId);
    Page<Store> findByStatus(Store.StoreStatus status, Pageable pageable);
    Page<Store> findByStatusAndNameContainingIgnoreCase(Store.StoreStatus status, String q, Pageable pageable);
    long countByStatus(Store.StoreStatus status);
}
