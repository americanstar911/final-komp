package java.Dto;

import java.Entities.UserRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    private String fullName;
    private String email;
    private String password;
    private UserRole role;
}