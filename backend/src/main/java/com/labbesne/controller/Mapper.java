package com.labbesne.controller;

import com.labbesne.entity.*;
import java.util.*;
import java.util.stream.Collectors;

public class Mapper {
    static String firstImage(Product p) {
        return p.getVariants().stream()
                .flatMap(v -> v.getImages().stream())
                .map(ProductImage::getImageUrl).findFirst().orElse(null);
    }

    public static Map<String, Object> product(Product p) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", p.getId());
        m.put("name", p.getName());
        m.put("category", p.getCategory());
        m.put("gender", p.getGender());
        m.put("basePrice", p.getBasePrice());
        m.put("discountPrice", p.getDiscountPrice());
        m.put("image", firstImage(p));
        m.put("storeId", p.getStore().getId());
        m.put("storeName", p.getStore().getName());
        m.put("colors", p.getVariants().stream().map(ProductVariant::getColorHex)
                .filter(Objects::nonNull).collect(Collectors.toList()));
        return m;
    }

    public static Map<String, Object> productFull(Product p) {
        Map<String, Object> m = product(p);
        m.put("description", p.getDescription());
        m.put("tags", p.getTags());
        m.put("fulfillment", p.getFulfillment());
        m.put("status", p.getStatus().name());
        m.put("variants", p.getVariants().stream().map(v -> {
            Map<String, Object> vm = new HashMap<>();
            vm.put("id", v.getId());
            vm.put("colorName", v.getColorName());
            vm.put("colorHex", v.getColorHex());
            vm.put("price", v.getPrice());
            vm.put("stockQuantity", v.getStockQuantity());
            vm.put("availableSizes", v.getAvailableSizes());
            vm.put("images", v.getImages().stream().map(ProductImage::getImageUrl).toList());
            return vm;
        }).toList());
        return m;
    }

    public static Map<String, Object> storeCard(Store s) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", s.getId());
        m.put("name", s.getName());
        m.put("logoUrl", s.getLogoUrl());
        m.put("bannerUrl", s.getBannerUrl());
        m.put("categories", s.getCategories());
        m.put("address", s.getAddress());
        return m;
    }

    public static Map<String, Object> storeFull(Store s) {
        Map<String, Object> m = storeCard(s);
        m.put("description", s.getDescription());
        m.put("phone", s.getPhone());
        m.put("whatsapp", s.getWhatsapp());
        m.put("instagram", s.getInstagram());
        m.put("website", s.getWebsite());
        m.put("latitude", s.getLatitude());
        m.put("longitude", s.getLongitude());
        m.put("status", s.getStatus().name());
        m.put("hours", s.getHours().stream().map(h -> Map.of(
                "dayOfWeek", h.getDayOfWeek(), "openTime", String.valueOf(h.getOpenTime()),
                "closeTime", String.valueOf(h.getCloseTime()), "closed", h.isClosed())).toList());
        return m;
    }
}
