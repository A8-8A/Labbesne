package com.labbesne.service;

import com.labbesne.dto.Dtos.*;
import com.labbesne.entity.*;
import com.labbesne.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;

@Service
public class StoreService {
    private final StoreRepository stores;
    private final UserRepository users;

    public StoreService(StoreRepository stores, UserRepository users) {
        this.stores = stores; this.users = users;
    }

    @Transactional
    public Store createOrUpdate(Long ownerId, Long storeId, StoreRequest req) {
        Store store;
        if (storeId != null) {
            store = stores.findById(storeId).orElseThrow();
            if (!store.getOwner().getId().equals(ownerId)) throw new SecurityException("Not your store");
        } else {
            store = new Store();
            store.setOwner(users.findById(ownerId).orElseThrow());
        }
        store.setName(req.name());
        store.setDescription(req.description());
        store.setAddress(req.address());
        store.setLatitude(req.latitude());
        store.setLongitude(req.longitude());
        store.setPhone(req.phone());
        store.setWhatsapp(req.whatsapp());
        store.setInstagram(req.instagram());
        store.setWebsite(req.website());
        store.setGooglePlaceId(req.googlePlaceId());
        if (req.logoUrl() != null) store.setLogoUrl(req.logoUrl());
        if (req.bannerUrl() != null) store.setBannerUrl(req.bannerUrl());
        store.setCategories(req.categories());
        store.setUpdatedAt(Instant.now());
        store.getHours().clear();
        if (req.hours() != null) {
            for (HourDto h : req.hours()) {
                StoreHour hour = StoreHour.builder().store(store).dayOfWeek(h.dayOfWeek())
                        .openTime(h.openTime()).closeTime(h.closeTime()).closed(h.closed()).build();
                store.getHours().add(hour);
            }
        }
        // edits to an approved store keep it live; new stores start PENDING (default)
        return stores.save(store);
    }
}
