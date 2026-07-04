package com.labbesne.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.*;

@Entity @Table(name = "stores")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Store {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "owner_id")
    private User owner;
    @Column(nullable = false)
    private String name;
    @Column(length = 2000)
    private String description;
    private String address;
    private Double latitude;
    private Double longitude;
    private String phone;
    private String whatsapp;
    private String instagram;
    private String website;
    private String googlePlaceId;
    private String logoUrl;
    private String bannerUrl;
    private String categories;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StoreStatus status = StoreStatus.PENDING;
    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StoreHour> hours = new ArrayList<>();
    @Builder.Default
    private Instant createdAt = Instant.now();
    private Instant updatedAt;

    public enum StoreStatus { PENDING, APPROVED, REJECTED, SUSPENDED }
}
