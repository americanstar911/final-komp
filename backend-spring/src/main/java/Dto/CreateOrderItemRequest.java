package Dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateOrderItemRequest {
    private Long productId;
    private Integer quantity;
}
