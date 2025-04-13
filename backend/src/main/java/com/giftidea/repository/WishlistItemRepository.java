package com.giftidea.repository;

import com.giftidea.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUserId(String userId);

    @Query("SELECT w FROM WishlistItem w WHERE w.userId = :userId AND w.product.id = :productId")
    Optional<WishlistItem> findByUserIdAndProductId(@Param("userId") String userId, @Param("productId") Long productId);

    @Modifying
    @Query("DELETE FROM WishlistItem w WHERE w.userId = :userId AND w.product.id = :productId")
    void deleteByUserIdAndProductId(@Param("userId") String userId, @Param("productId") Long productId);
} 