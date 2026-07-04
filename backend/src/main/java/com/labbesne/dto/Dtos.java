package com.labbesne.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class Dtos {
    public record RegisterRequest(@NotBlank String name, @Email @NotBlank String email,
                                  @Size(min = 8) String password, String phone, @NotBlank String role) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record AuthResponse(String token, Long userId, String name, String email, String role) {}

    public record StoreRequest(@NotBlank String name, String description, String address,
                               Double latitude, Double longitude, String phone, String whatsapp,
                               String instagram, String website, String googlePlaceId,
                               String logoUrl, String bannerUrl, String categories,
                               List<HourDto> hours) {}
    public record HourDto(Integer dayOfWeek, String openTime, String closeTime, boolean closed) {}

    public record VariantRequest(Long id, String colorName, String colorHex, BigDecimal price,
                                 Integer stockQuantity, String availableSizes, List<String> imageUrls) {}
    public record ProductRequest(@NotBlank String name, String description, String category,
                                 String gender, BigDecimal basePrice, BigDecimal discountPrice,
                                 String tags, String fulfillment, String status,
                                 List<VariantRequest> variants) {}

    public record TransactionRequest(@NotNull Long productId, Long variantId, @NotBlank String type,
                                     String message, String selectedSize) {}
    public record ReportRequest(@NotBlank String targetType, @NotNull Long targetId,
                                @NotBlank String reason, String description) {}
    public record StatusUpdate(@NotBlank String status, String reason) {}
}
