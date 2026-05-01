package java.Controllers;

import java.Entities.order.Order;
import java.Entities.order.OrderItem;
import java.Repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;

    @GetMapping
    public List<Order> getOrders(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            return orderRepository.findByUserId(userId);
        }

        return orderRepository.findAll();
    }

    @PostMapping
    public Order addOrder(@RequestBody Order order) {
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrder(order);
            }
        }

        return orderRepository.save(order);
    }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderRepository.deleteById(id);
    }
}