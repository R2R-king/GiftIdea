package com.giftidea.service;

import com.giftidea.model.CartItem;
import com.giftidea.model.Product;
import com.giftidea.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductService productService;

    @Autowired
    public CartService(CartItemRepository cartItemRepository, ProductService productService) {
        this.cartItemRepository = cartItemRepository;
        this.productService = productService;
    }

    public List<CartItem> getCartItemsForUser(String userId) {
        return cartItemRepository.findByUserId(userId);
    }

    @Transactional
    public CartItem addToCart(String userId, Long productId, Integer quantity) {
        Optional<Product> productOpt = productService.getProductById(productId);
        if (productOpt.isEmpty()) {
            throw new IllegalArgumentException("Product with id " + productId + " not found");
        }

        Product product = productOpt.get();
        
        // Check if item already exists in cart
        Optional<CartItem> existingCartItem = cartItemRepository.findByUserIdAndProductId(userId, productId);
        
        if (existingCartItem.isPresent()) {
            // Update quantity if item already exists
            CartItem cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            return cartItemRepository.save(cartItem);
        } else {
            // Create new cart item
            CartItem newCartItem = new CartItem();
            newCartItem.setUserId(userId);
            newCartItem.setProduct(product);
            newCartItem.setQuantity(quantity);
            return cartItemRepository.save(newCartItem);
        }
    }

    @Transactional
    public void updateCartItemQuantity(Long cartItemId, Integer quantity) {
        Optional<CartItem> cartItemOpt = cartItemRepository.findById(cartItemId);
        if (cartItemOpt.isPresent()) {
            CartItem cartItem = cartItemOpt.get();
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        } else {
            throw new IllegalArgumentException("Cart item with id " + cartItemId + " not found");
        }
    }

    @Transactional
    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    @Transactional
    public void clearCart(String userId) {
        List<CartItem> userCartItems = cartItemRepository.findByUserId(userId);
        cartItemRepository.deleteAll(userCartItems);
    }
} 