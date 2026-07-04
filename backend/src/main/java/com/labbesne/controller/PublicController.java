package com.labbesne.controller;

import com.labbesne.entity.*;
import com.labbesne.repository.*;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class PublicController {
    private final ProductRepository products;
    private final StoreRepository stores;

    public PublicController(ProductRepository products, StoreRepository stores) {
        this.products = products; this.stores = stores;
    }

    @GetMapping("/health")
    public Map<String, String> health() { return Map.of("status", "ok"); }

    @GetMapping("/home")
    public Map<String, Object> home() {
        var recent = products.findByStatus(Product.ProductStatus.ACTIVE,
                PageRequest.of(0, 12, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        var discounted = products.findDiscounted(PageRequest.of(0, 12)).getContent();
        var popularStores = stores.findByStatus(Store.StoreStatus.APPROVED,
                PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        return Map.of(
                "newArrivals", recent.stream().map(Mapper::product).toList(),
                "discounted", discounted.stream().map(Mapper::product).toList(),
                "popularStores", popularStores.stream().map(Mapper::storeCard).toList());
    }

    @GetMapping("/search")
    public Map<String, Object> search(@RequestParam String q,
                                      @RequestParam(defaultValue = "0") int page) {
        var productHits = products.search(q, PageRequest.of(page, 20));
        var storeHits = stores.findByStatusAndNameContainingIgnoreCase(
                Store.StoreStatus.APPROVED, q, PageRequest.of(page, 10));
        return Map.of(
                "products", productHits.getContent().stream().map(Mapper::product).toList(),
                "stores", storeHits.getContent().stream().map(Mapper::storeCard).toList(),
                "productTotal", productHits.getTotalElements(),
                "storeTotal", storeHits.getTotalElements());
    }

    @GetMapping("/products")
    public Map<String, Object> browse(@RequestParam(required = false) String category,
                                      @RequestParam(defaultValue = "0") int page) {
        Page<Product> result = (category == null || category.isBlank())
                ? products.findByStatus(Product.ProductStatus.ACTIVE, PageRequest.of(page, 24, Sort.by(Sort.Direction.DESC, "createdAt")))
                : products.findByStatusAndCategoryIgnoreCase(Product.ProductStatus.ACTIVE, category, PageRequest.of(page, 24));
        return Map.of("items", result.getContent().stream().map(Mapper::product).toList(),
                "total", result.getTotalElements(), "page", page);
    }

    @GetMapping("/products/{id}")
    public Map<String, Object> product(@PathVariable Long id) {
        Product p = products.findById(id).orElseThrow();
        Map<String, Object> dto = new HashMap<>(Mapper.productFull(p));
        var similar = products.findByStatusAndCategoryIgnoreCase(Product.ProductStatus.ACTIVE,
                        p.getCategory() == null ? "" : p.getCategory(), PageRequest.of(0, 6))
                .getContent().stream().filter(x -> !x.getId().equals(id)).map(Mapper::product).toList();
        dto.put("similar", similar);
        return dto;
    }

    @GetMapping("/stores/{id}")
    public Map<String, Object> store(@PathVariable Long id) {
        Store s = stores.findById(id).orElseThrow();
        Map<String, Object> dto = new HashMap<>(Mapper.storeFull(s));
        dto.put("products", products.findByStoreId(id, PageRequest.of(0, 50)).getContent()
                .stream().filter(p -> p.getStatus() == Product.ProductStatus.ACTIVE)
                .map(Mapper::product).toList());
        return dto;
    }
}
