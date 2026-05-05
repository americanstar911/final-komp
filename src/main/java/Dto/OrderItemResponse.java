package main.java.Dto;

import main.java.Entities.order.OrderItem;
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
    private Integer qty;
    private Double price;

    public static OrderItemResponse fromEntity(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getImage(),
                item.getQuantity(),
                item.getQuantity(),
                item.getPrice()
        );
    }
}
