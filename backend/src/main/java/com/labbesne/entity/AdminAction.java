package com.labbesne.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name = "admin_actions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminAction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "admin_id")
    private User admin;
    private String actionType;
    private String targetType;
    private Long targetId;
    @Column(length = 1000)
    private String reason;
    @Builder.Default
    private Instant createdAt = Instant.now();
}
