package main.java.Dto;

import main.java.Entities.order.Order;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private String status;
    private String address;
    private Double total;
    private Double totalPrice;
    private String createdAt;
    private List<OrderItemResponse> items;

    public static OrderResponse fromEntity(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getFullName(),
                order.getStatus().name().toLowerCase(),
                order.getAddress(),
                order.getTotalPrice(),
                order.getTotalPrice(),
                order.getCreatedAt() == null ? null : order.getCreatedAt().toString(),
                order.getItems() == null
                        ? List.of()
                        : order.getItems().stream().map(OrderItemResponse::fromEntity).toList()
        );
    }
}
