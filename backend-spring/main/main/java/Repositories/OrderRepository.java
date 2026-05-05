package Repositories;

import Entities.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByUserEmailOrderByCreatedAtDesc(String email);
    List<Order> findAllByOrderByCreatedAtDesc();
}
