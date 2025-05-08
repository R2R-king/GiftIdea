package com.giftidea.dto;

import java.util.Objects;

public record GiftDTO(
    Long id,
    String name,
    String description,
    String category,
    Double price,
    String imageUrl,
    boolean isFavorite
) {
    public GiftDTO {
        Objects.requireNonNull(name, "Name cannot be null");
        if (name.isBlank()) {
            throw new IllegalArgumentException("Name cannot be blank");
        }
        
        Objects.requireNonNull(description, "Description cannot be null");
        Objects.requireNonNull(category, "Category cannot be null");
        Objects.requireNonNull(price, "Price cannot be null");
        
        if (price < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
    }
} 