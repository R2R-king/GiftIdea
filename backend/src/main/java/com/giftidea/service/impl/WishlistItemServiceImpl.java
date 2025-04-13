package com.giftidea.service.impl;

import com.giftidea.dto.ProductResponse;
import com.giftidea.exception.ResourceNotFoundException;
import com.giftidea.mapper.ProductMapper;
import com.giftidea.model.Product;
import com.giftidea.model.WishlistItem;
import com.giftidea.repository.ProductRepository;
import com.giftidea.repository.WishlistItemRepository;
import com.giftidea.service.WishlistItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistItemServiceImpl implements WishlistItemService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public List<ProductResponse> getUserWishlist(String userId) {
        List<WishlistItem> wishlistItems = wishlistItemRepository.findByUserId(userId);
        return wishlistItems.stream()
                .map(item -> productMapper.toProductResponse(item.getProduct()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addToWishlist(String userId, Long productId) {
        if (!isInWishlist(userId, productId)) {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
            
            WishlistItem wishlistItem = new WishlistItem();
            wishlistItem.setUserId(userId);
            wishlistItem.setProduct(product);
            wishlistItem.setDateAdded(LocalDateTime.now());
            wishlistItemRepository.save(wishlistItem);
        }
    }

    @Override
    @Transactional
    public void removeFromWishlist(String userId, Long productId) {
        wishlistItemRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Override
    public boolean isInWishlist(String userId, Long productId) {
        return wishlistItemRepository.findByUserIdAndProductId(userId, productId).isPresent();
    }
} 