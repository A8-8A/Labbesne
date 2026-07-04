package com.labbesne.controller;

import com.labbesne.dto.Dtos.*;
import com.labbesne.entity.*;
import com.labbesne.repository.*;
import com.labbesne.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/owner")
public class OwnerController {
    private final StoreRepository stores;
    private final ProductRepository products;
    private final TransactionRepository transactions;
    private final StoreService storeService;
    private final ProductService productService;

    public OwnerController(StoreRepository stores, ProductRepository products,
                           TransactionRepository transactions, StoreService storeService,
                           ProductService productService) {
        this.stores = stores; this.products = products; this.transactions = transactions;
        this.storeService = storeService; this.productService = productService;
    }

    @GetMapping("/store")
    public ResponseEntity<?> myStore(@AuthenticationPrincipal Long userId) {
        var list = stores.findByOwnerId(userId);
        if (list.isEmpty()) return ResponseEntity.ok(Map.of("exists", false));
        return ResponseEntity.ok(Map.of("exists", true, "store", Mapper.storeFull(list.get(0))));
    }

    @PostMapping("/store")
    public Map<String, Object> createStore(@AuthenticationPrincipal Long userId,
                                           @Valid @RequestBody StoreRequest req) {
        return Mapper.storeFull(storeService.createOrUpdate(userId, null, req));
    }

    @PutMapping("/store/{id}")
    public Map<String, Object> updateStore(@AuthenticationPrincipal Long userId,
                                           @PathVariable Long id, @Valid @RequestBody StoreRequest req) {
        return Mapper.storeFull(storeService.createOrUpdate(userId, id, req));
    }

    @GetMapping("/store/{storeId}/products")
    public Object myProducts(@AuthenticationPrincipal Long userId, @PathVariable Long storeId,
                             @RequestParam(defaultValue = "0") int page) {
        requireOwnership(userId, storeId);
        return products.findByStoreId(storeId, PageRequest.of(page, 50)).getContent()
                .stream().map(Mapper::productFull).toList();
    }

    @PostMapping("/store/{storeId}/products")
    public Map<String, Object> createProduct(@AuthenticationPrincipal Long userId,
                                             @PathVariable Long storeId,
                                             @Valid @RequestBody ProductRequest req) {
        return Mapper.productFull(productService.createOrUpdate(userId, storeId, null, req));
    }

    @PutMapping("/store/{storeId}/products/{productId}")
    public Map<String, Object> updateProduct(@AuthenticationPrincipal Long userId,
                                             @PathVariable Long storeId, @PathVariable Long productId,
                                             @Valid @RequestBody ProductRequest req) {
        return Mapper.productFull(productService.createOrUpdate(userId, storeId, productId, req));
    }

    @DeleteMapping("/store/{storeId}/products/{productId}")
    public Map<String, String> deleteProduct(@AuthenticationPrincipal Long userId,
                                             @PathVariable Long storeId, @PathVariable Long productId) {
        requireOwnership(userId, storeId);
        Product p = products.findById(productId).orElseThrow();
        p.setStatus(Product.ProductStatus.REMOVED);
        products.save(p);
        return Map.of("status", "removed");
    }

    @GetMapping("/store/{storeId}/transactions")
    public Object storeTransactions(@AuthenticationPrincipal Long userId, @PathVariable Long storeId,
                                    @RequestParam(defaultValue = "0") int page) {
        requireOwnership(userId, storeId);
        return transactions.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(page, 30))
                .getContent().stream().map(TxController::txDto).toList();
    }

    @PatchMapping("/transactions/{id}")
    public Map<String, Object> updateTx(@AuthenticationPrincipal Long userId, @PathVariable Long id,
                                        @RequestBody StatusUpdate req) {
        Transaction tx = transactions.findById(id).orElseThrow();
        requireOwnership(userId, tx.getStore().getId());
        tx.setStatus(Transaction.TxStatus.valueOf(req.status()));
        tx.setUpdatedAt(Instant.now());
        transactions.save(tx);
        return TxController.txDto(tx);
    }

    private void requireOwnership(Long userId, Long storeId) {
        Store s = stores.findById(storeId).orElseThrow();
        if (!s.getOwner().getId().equals(userId)) throw new SecurityException("Not your store");
    }
}
