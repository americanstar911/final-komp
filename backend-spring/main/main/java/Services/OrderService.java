package Services;

import Dto.CreateOrderItemRequest;
import Dto.CreateOrderRequest;
import Dto.OrderResponse;
import Dto.UpdateOrderAddressRequest;
import Entities.Product;
import Entities.User;
import Entities.order.Order;
import Entities.order.OrderItem;
import Entities.order.OrderStatus;
import Repositories.OrderRepository;
import Repositories.ProductRepository;
import Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order must contain at least one item");
        }

        Order order = new Order();
        order.setUser(currentUser);
        order.setAddress(request.getAddress());
        order.setStatus(OrderStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        double totalPrice = 0;

        for (CreateOrderItemRequest itemRequest : request.getItems()) {
            if (itemRequest.getProductId() == null) {
                throw new RuntimeException("Product id is required");
            }

            if (itemRequest.getQuantity() == null || itemRequest.getQuantity() <= 0) {
                throw new RuntimeException("Quantity must be greater than zero");
            }

            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStock() != null && product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            if (product.getStock() != null) {
                product.setStock(product.getStock() - itemRequest.getQuantity());
                productRepository.save(product);
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(product.getPrice());

            orderItems.add(orderItem);
            totalPrice += product.getPrice() * itemRequest.getQuantity();
        }

        order.setItems(orderItems);
        order.setTotalPrice(totalPrice);

        return OrderResponse.fromEntity(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        return orderRepository.findByUserEmailOrderByCreatedAtDesc(currentUser.getEmail())
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Transactional
    public OrderResponse cancelMyOrder(Long orderId, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Order order = getOrderForCurrentUser(orderId, currentUser);

        order.setStatus(OrderStatus.CANCELLED);

        return OrderResponse.fromEntity(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateMyOrderAddress(
            Long orderId,
            UpdateOrderAddressRequest request,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        Order order = getOrderForCurrentUser(orderId, currentUser);

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cancelled order cannot be updated");
        }

        order.setAddress(request.getAddress());

        return OrderResponse.fromEntity(orderRepository.save(order));
    }

    @Transactional
    public void deleteOrderAsAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        orderRepository.delete(order);
    }

    private Order getOrderForCurrentUser(Long orderId, User currentUser) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        return order;
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
