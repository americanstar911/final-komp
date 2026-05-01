package Controllers;

import Repositories.UserRepository;
import Entities.User.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "email already exists";
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            user.setRole(UserRole.USER);
        }

        userRepository.save(user);
        return "register success";
    }

    @PostMapping("/login")
    public String login(@RequestBody User authUser, HttpServletRequest request) {
        User user = userRepository.findByEmail(authUser.getEmail()).orElse(null);

        if (user == null) {
            return "auth failed";
        }

        if (passwordEncoder.matches(authUser.getPassword(), user.getPassword())) {
            request.getSession().setAttribute("user", user);
            return "auth success";
        }

        return "auth failed";
    }
}