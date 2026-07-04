package com.labbesne.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Entity @Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "store_id")
    private Store store;
    @Column(nullable = false)
    private String name;
    @Column(length = 3000)
    private String description;
    private String category;
    private String gender;
    private BigDecimal basePrice;
    private BigDecimal discountPrice;
    private String tags;
    private String fulfillment;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProductStatus status = ProductStatus.DRAFT;
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();
    @Builder.Default
    private Instant createdAt = Instant.now();
    private Instant updatedAt;

    public enum ProductStatus { DRAFT, ACTIVE, HIDDEN, REMOVED }
}
