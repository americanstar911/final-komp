package Dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import Dto.CreateOrderItemRequest;

@Getter
@Setter
public class CreateOrderRequest {
    private String address;
    private List<CreateOrderItemRequest> items;
}
