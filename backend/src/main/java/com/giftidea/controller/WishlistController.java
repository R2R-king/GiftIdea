package com.giftidea.controller;

import com.giftidea.dto.ProductResponse;
import com.giftidea.service.WishlistItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistItemService wishlistItemService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getWishlist(Authentication authentication) {
        String userId = authentication.getName();
        List<ProductResponse> wishlistItems = wishlistItemService.getUserWishlist(userId);
        return ResponseEntity.ok(wishlistItems);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> addToWishlist(@PathVariable Long productId, Authentication authentication) {
        String userId = authentication.getName();
        wishlistItemService.addToWishlist(userId, productId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long productId, Authentication authentication) {
        String userId = authentication.getName();
        wishlistItemService.removeFromWishlist(userId, productId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<Boolean> checkInWishlist(@PathVariable Long productId, Authentication authentication) {
        String userId = authentication.getName();
        boolean isInWishlist = wishlistItemService.isInWishlist(userId, productId);
        return ResponseEntity.ok(isInWishlist);
    }
} 