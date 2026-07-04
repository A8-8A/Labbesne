package com.labbesne.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "product_images")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductImage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "variant_id")
    private ProductVariant variant;
    @Column(nullable = false)
    private String imageUrl;
    private Integer sortOrder;
}
