package com.labbesne.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name = "reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Report {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "reporter_id")
    private User reporter;
    @Enumerated(EnumType.STRING)
    private TargetType targetType;
    private Long targetId;
    private String reason;
    @Column(length = 2000)
    private String description;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReportStatus status = ReportStatus.OPEN;
    @Builder.Default
    private Instant createdAt = Instant.now();
    private Instant updatedAt;

    public enum TargetType { STORE, PRODUCT, USER, TRANSACTION }
    public enum ReportStatus { OPEN, REVIEWING, RESOLVED, DISMISSED }
}
