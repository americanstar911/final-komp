package java.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequest {

    private String name;
    private String description;
    private Double price;
    private String image;
    private Integer stock;
    private Long categoryId;
}