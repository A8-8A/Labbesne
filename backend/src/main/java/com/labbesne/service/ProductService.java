package com.labbesne.service;

import com.labbesne.dto.Dtos.*;
import com.labbesne.entity.*;
import com.labbesne.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
public class ProductService {
    private final ProductRepository products;
    private final StoreRepository stores;

    public ProductService(ProductRepository products, StoreRepository stores) {
        this.products = products; this.stores = stores;
    }

    @Transactional
    public Product createOrUpdate(Long ownerId, Long storeId, Long productId, ProductRequest req) {
        Store store = stores.findById(storeId).orElseThrow();
        if (!store.getOwner().getId().equals(ownerId)) throw new SecurityException("Not your store");

        Product p;
        if (productId != null) {
            p = products.findById(productId).orElseThrow();
            if (!p.getStore().getId().equals(storeId)) throw new SecurityException("Wrong store");
        } else {
            p = new Product();
            p.setStore(store);
        }
        p.setName(req.name());
        p.setDescription(req.description());
        p.setCategory(req.category());
        p.setGender(req.gender());
        p.setBasePrice(req.basePrice());
        p.setDiscountPrice(req.discountPrice());
        p.setTags(req.tags());
        p.setFulfillment(req.fulfillment());
        if (req.status() != null) p.setStatus(Product.ProductStatus.valueOf(req.status()));
        p.setUpdatedAt(Instant.now());

        p.getVariants().clear();
        if (req.variants() != null) {
            for (VariantRequest v : req.variants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(p).colorName(v.colorName()).colorHex(v.colorHex())
                        .price(v.price()).stockQuantity(v.stockQuantity())
                        .availableSizes(v.availableSizes()).build();
                if (v.imageUrls() != null) {
                    int i = 0;
                    for (String url : v.imageUrls()) {
                        variant.getImages().add(ProductImage.builder()
                                .variant(variant).imageUrl(url).sortOrder(i++).build());
                    }
                }
                p.getVariants().add(variant);
            }
        }
        return products.save(p);
    }
}
