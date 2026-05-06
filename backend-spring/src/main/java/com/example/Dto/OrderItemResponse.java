package com.example.Dto;

import com.example.Entities.order.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String name;
    private String image;
    private Integer quantity;
    private Double price;

    public static OrderItemResponse fromEntity(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getImage(),
                item.getQuantity(),
                item.getPrice()
        );
    }
}
