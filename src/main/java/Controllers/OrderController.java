package main.java.Controllers;

import main.java.Dto.CreateOrderRequest;
import main.java.Dto.OrderResponse;
import main.java.Dto.UpdateOrderAddressRequest;
import main.java.Entities.order.Order;
import main.java.Entities.order.OrderItem;
import main.java.Repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import main.java.Services.OrderService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/orders")
    public OrderResponse createOrder(@RequestBody CreateOrderRequest request, Authentication authentication) {
        return orderService.createOrder(request, authentication);
    }

    @GetMapping("/orders/my")
    public List<OrderResponse> getMyOrders(Authentication authentication) {
        return orderService.getMyOrders(authentication);
    }

    @PatchMapping("/orders/{id}/cancel")
    public OrderResponse cancelMyOrder(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return orderService.cancelMyOrder(id, authentication);
    }

    @PatchMapping("/orders/{id}/address")
    public OrderResponse updateMyOrderAddress(
            @PathVariable Long id,
            @RequestBody UpdateOrderAddressRequest request,
            Authentication authentication
    ) {
        return orderService.updateMyOrderAddress(id, request, authentication);
    }

    @GetMapping("/admin/orders")
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    @DeleteMapping("/admin/orders/{id}")
    public void deleteOrderAsAdmin(@PathVariable Long id) {
        orderService.deleteOrderAsAdmin(id);
    }
}