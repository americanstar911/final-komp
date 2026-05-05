package main.java.Dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateOrderRequest {
    private String address;
    private List<CreateOrderItemRequest> items;
}
