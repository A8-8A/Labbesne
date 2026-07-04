package com.labbesne.repository;

import com.labbesne.entity.Product;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByStoreId(Long storeId, Pageable pageable);
    Page<Product> findByStatus(Product.ProductStatus status, Pageable pageable);
    Page<Product> findByStatusAndCategoryIgnoreCase(Product.ProductStatus status, String category, Pageable pageable);

    @Query("select p from Product p join p.store s where p.status = 'ACTIVE' and s.status = 'APPROVED' " +
           "and (lower(p.name) like lower(concat('%', :q, '%')) or lower(p.tags) like lower(concat('%', :q, '%')))")
    Page<Product> search(@Param("q") String q, Pageable pageable);

    @Query("select p from Product p join p.store s where p.status = 'ACTIVE' and s.status = 'APPROVED' and p.discountPrice is not null")
    Page<Product> findDiscounted(Pageable pageable);
}
