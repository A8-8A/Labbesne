package com.labbesne.controller;

import com.labbesne.dto.Dtos.*;
import com.labbesne.entity.*;
import com.labbesne.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository users;
    private final StoreRepository stores;
    private final ProductRepository products;
    private final ReportRepository reports;
    private final AdminActionRepository actions;

    public AdminController(UserRepository users, StoreRepository stores, ProductRepository products,
                           ReportRepository reports, AdminActionRepository actions) {
        this.users = users; this.stores = stores; this.products = products;
        this.reports = reports; this.actions = actions;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        return Map.of(
                "totalUsers", users.count(),
                "totalCustomers", users.countByRole(User.Role.CUSTOMER),
                "totalOwners", users.countByRole(User.Role.OWNER),
                "totalStores", stores.count(),
                "pendingStores", stores.countByStatus(Store.StoreStatus.PENDING),
                "openReports", reports.countByStatus(Report.ReportStatus.OPEN));
    }

    @GetMapping("/stores")
    public Object storesByStatus(@RequestParam(defaultValue = "PENDING") String status,
                                 @RequestParam(defaultValue = "0") int page) {
        return stores.findByStatus(Store.StoreStatus.valueOf(status), PageRequest.of(page, 30))
                .getContent().stream().map(Mapper::storeFull).toList();
    }

    @PatchMapping("/stores/{id}")
    public Map<String, Object> updateStore(@AuthenticationPrincipal Long adminId,
                                           @PathVariable Long id, @RequestBody StatusUpdate req) {
        Store s = stores.findById(id).orElseThrow();
        s.setStatus(Store.StoreStatus.valueOf(req.status()));
        s.setUpdatedAt(Instant.now());
        stores.save(s);
        log(adminId, "STORE_" + req.status(), "STORE", id, req.reason());
        return Mapper.storeFull(s);
    }

    @GetMapping("/reports")
    public Object reportList(@RequestParam(defaultValue = "OPEN") String status,
                             @RequestParam(defaultValue = "0") int page) {
        return reports.findByStatusOrderByCreatedAtDesc(Report.ReportStatus.valueOf(status), PageRequest.of(page, 30))
                .getContent().stream().map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", r.getId());
                    m.put("targetType", r.getTargetType().name());
                    m.put("targetId", r.getTargetId());
                    m.put("reason", r.getReason());
                    m.put("description", r.getDescription());
                    m.put("status", r.getStatus().name());
                    m.put("reporterName", r.getReporter().getName());
                    m.put("createdAt", r.getCreatedAt().toString());
                    return m;
                }).toList();
    }

    @PatchMapping("/reports/{id}")
    public Map<String, String> updateReport(@AuthenticationPrincipal Long adminId,
                                            @PathVariable Long id, @RequestBody StatusUpdate req) {
        Report r = reports.findById(id).orElseThrow();
        r.setStatus(Report.ReportStatus.valueOf(req.status()));
        r.setUpdatedAt(Instant.now());
        reports.save(r);
        log(adminId, "REPORT_" + req.status(), "REPORT", id, req.reason());
        return Map.of("status", r.getStatus().name());
    }

    @GetMapping("/users")
    public Object userList(@RequestParam(defaultValue = "0") int page) {
        return users.findAll(PageRequest.of(page, 50)).getContent().stream().map(u -> Map.of(
                "id", u.getId(), "name", u.getName(), "email", u.getEmail(),
                "role", u.getRole().name(), "status", u.getStatus().name())).toList();
    }

    @PatchMapping("/users/{id}")
    public Map<String, String> updateUser(@AuthenticationPrincipal Long adminId,
                                          @PathVariable Long id, @RequestBody StatusUpdate req) {
        User u = users.findById(id).orElseThrow();
        u.setStatus(User.UserStatus.valueOf(req.status()));
        u.setUpdatedAt(Instant.now());
        users.save(u);
        log(adminId, "USER_" + req.status(), "USER", id, req.reason());
        return Map.of("status", u.getStatus().name());
    }

    @PatchMapping("/products/{id}")
    public Map<String, String> updateProduct(@AuthenticationPrincipal Long adminId,
                                             @PathVariable Long id, @RequestBody StatusUpdate req) {
        Product p = products.findById(id).orElseThrow();
        p.setStatus(Product.ProductStatus.valueOf(req.status()));
        p.setUpdatedAt(Instant.now());
        products.save(p);
        log(adminId, "PRODUCT_" + req.status(), "PRODUCT", id, req.reason());
        return Map.of("status", p.getStatus().name());
    }

    @GetMapping("/audit-log")
    public Object auditLog(@RequestParam(defaultValue = "0") int page) {
        return actions.findAllByOrderByCreatedAtDesc(PageRequest.of(page, 50)).getContent()
                .stream().map(a -> Map.of(
                        "id", a.getId(), "adminName", a.getAdmin().getName(),
                        "actionType", a.getActionType(), "targetType", String.valueOf(a.getTargetType()),
                        "targetId", a.getTargetId(), "reason", String.valueOf(a.getReason()),
                        "createdAt", a.getCreatedAt().toString())).toList();
    }

    private void log(Long adminId, String action, String targetType, Long targetId, String reason) {
        actions.save(AdminAction.builder().admin(users.findById(adminId).orElseThrow())
                .actionType(action).targetType(targetType).targetId(targetId).reason(reason).build());
    }
}
