package com.pinnacle.inventory.scheduler;

import com.pinnacle.inventory.client.ProductServiceClient;
import com.pinnacle.inventory.dto.StockUpdateRequest;
import com.pinnacle.inventory.entity.Inventory;
import com.pinnacle.inventory.entity.StockReservation;
import com.pinnacle.inventory.repository.InventoryRepository;
import com.pinnacle.inventory.repository.StockReservationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class InventorySyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(InventorySyncScheduler.class);

    private final InventoryRepository inventoryRepository;
    private final StockReservationRepository stockReservationRepository;
    private final ProductServiceClient productServiceClient;

    @Value("${inventory.reservation.ttl-ms:10800000}")
    private long reservationTtlMs;

    /**
     * Runs every {@code inventory.sync.interval-ms} (default 3 hours).
     * 1. Releases stale RESERVED reservations back to available stock.
     * 2. Syncs each inventory row's available quantity to product-service.
     */
    @Scheduled(fixedDelayString = "${inventory.sync.interval-ms:10800000}")
    @Transactional
    public void syncStock() {
        int released = releaseExpiredReservations();
        int synced = 0;
        int failed = 0;

        List<Inventory> inventories = inventoryRepository.findAll();
        for (Inventory inventory : inventories) {
            int reserved = inventory.getReservedQuantity() == null ? 0 : inventory.getReservedQuantity();
            int available = inventory.getQuantity() - reserved;
            try {
                productServiceClient.updateStock(inventory.getProductId(),
                        StockUpdateRequest.builder().stock(available).build());
                synced++;
            } catch (Exception e) {
                failed++;
                log.warn("Failed to sync stock for product {}: {}", inventory.getProductId(), e.getMessage());
            }
        }

        log.info("Inventory sync complete: {} reservations released, {} products synced, {} sync failures",
                released, synced, failed);
    }

    private int releaseExpiredReservations() {
        Instant cutoff = Instant.now().minusMillis(reservationTtlMs);
        List<StockReservation> expired = stockReservationRepository.findByStatusAndCreatedAtBefore("RESERVED", cutoff);
        for (StockReservation reservation : expired) {
            inventoryRepository.findByProductId(reservation.getProductId()).ifPresent(inventory -> {
                int reserved = inventory.getReservedQuantity() == null ? 0 : inventory.getReservedQuantity();
                inventory.setReservedQuantity(Math.max(0, reserved - reservation.getQuantity()));
                inventoryRepository.save(inventory);
            });
            reservation.setStatus("RELEASED");
            stockReservationRepository.save(reservation);
        }
        return expired.size();
    }
}
