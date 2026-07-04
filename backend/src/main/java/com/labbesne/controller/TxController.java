package com.labbesne.controller;

import com.labbesne.dto.Dtos.*;
import com.labbesne.entity.*;
import com.labbesne.repository.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class TxController {
    private final TransactionRepository transactions;
    private final ProductRepository products;
    private final ReportRepository reports;
    private final UserRepository users;

    public TxController(TransactionRepository transactions, ProductRepository products,
                        ReportRepository reports, UserRepository users) {
        this.transactions = transactions; this.products = products;
        this.reports = reports; this.users = users;
    }

    @PostMapping("/transactions")
    public Map<String, Object> create(@AuthenticationPrincipal Long userId,
                                      @Valid @RequestBody TransactionRequest req) {
        Product p = products.findById(req.productId()).orElseThrow();
        ProductVariant variant = req.variantId() == null ? null : p.getVariants().stream()
                .filter(v -> v.getId().equals(req.variantId())).findFirst().orElse(null);
        Transaction tx = Transaction.builder()
                .customer(users.findById(userId).orElseThrow())
                .store(p.getStore()).product(p).variant(variant)
                .type(Transaction.TxType.valueOf(req.type()))
                .message(req.message()).selectedSize(req.selectedSize()).build();
        return txDto(transactions.save(tx));
    }

    @GetMapping("/transactions/mine")
    public Object mine(@AuthenticationPrincipal Long userId, @RequestParam(defaultValue = "0") int page) {
        return transactions.findByCustomerIdOrderByCreatedAtDesc(userId, PageRequest.of(page, 30))
                .getContent().stream().map(TxController::txDto).toList();
    }

    @PostMapping("/reports")
    public Map<String, Object> report(@AuthenticationPrincipal Long userId,
                                      @Valid @RequestBody ReportRequest req) {
        Report r = Report.builder().reporter(users.findById(userId).orElseThrow())
                .targetType(Report.TargetType.valueOf(req.targetType()))
                .targetId(req.targetId()).reason(req.reason())
                .description(req.description()).build();
        reports.save(r);
        return Map.of("id", r.getId(), "status", r.getStatus().name());
    }

    static Map<String, Object> txDto(Transaction tx) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", tx.getId());
        m.put("type", tx.getType().name());
        m.put("status", tx.getStatus().name());
        m.put("message", tx.getMessage());
        m.put("selectedSize", tx.getSelectedSize());
        m.put("createdAt", tx.getCreatedAt().toString());
        m.put("customerName", tx.getCustomer().getName());
        m.put("productId", tx.getProduct().getId());
        m.put("productName", tx.getProduct().getName());
        m.put("storeId", tx.getStore().getId());
        m.put("storeName", tx.getStore().getName());
        if (tx.getVariant() != null) m.put("variantColor", tx.getVariant().getColorName());
        return m;
    }
}
