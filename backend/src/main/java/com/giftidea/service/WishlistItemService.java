package com.giftidea.service;

import com.giftidea.dto.ProductResponse;
import com.giftidea.model.WishlistItem;

import java.util.List;

public interface WishlistItemService {
    List<ProductResponse> getUserWishlist(String userId);
    void addToWishlist(String userId, Long productId);
    void removeFromWishlist(String userId, Long productId);
    boolean isInWishlist(String userId, Long productId);
} 