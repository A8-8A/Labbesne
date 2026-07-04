package com.labbesne.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "store_hours")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoreHour {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "store_id")
    private Store store;
    private Integer dayOfWeek;
    private String openTime;
    private String closeTime;
    private boolean closed;
}
