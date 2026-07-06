package com.pinnacle.inventory.mapper;

import com.pinnacle.inventory.entity.Inventory;
import com.pinnacle.inventory.dto.InventoryRequest;
import com.pinnacle.inventory.dto.InventoryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InventoryMapper {
    @Mapping(target = "availableQuantity", expression = "java(inventory.getQuantity() - (inventory.getReservedQuantity() == null ? 0 : inventory.getReservedQuantity()))")
    InventoryResponse toResponse(Inventory inventory);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "reservedQuantity", ignore = true)
    @Mapping(target = "vendorId", ignore = true)
    @Mapping(target = "version", ignore = true)
    Inventory toEntity(InventoryRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "reservedQuantity", ignore = true)
    @Mapping(target = "vendorId", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntityFromRequest(InventoryRequest request, @MappingTarget Inventory inventory);

    List<InventoryResponse> toResponseList(List<Inventory> inventories);
}
