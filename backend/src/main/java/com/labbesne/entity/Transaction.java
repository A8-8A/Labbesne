package com.labbesne.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name = "transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id")
    private User customer;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "store_id")
    private Store store;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id")
    private Product product;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "variant_id")
    private ProductVariant variant;
    @Enumerated(EnumType.STRING)
    private TxType type;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TxStatus status = TxStatus.PENDING;
    @Column(length = 2000)
    private String message;
    private String selectedSize;
    @Builder.Default
    private Instant createdAt = Instant.now();
    private Instant updatedAt;

    public enum TxType { INQUIRY, RESERVATION, ORDER }
    public enum TxStatus { PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED, DISPUTED }
}
