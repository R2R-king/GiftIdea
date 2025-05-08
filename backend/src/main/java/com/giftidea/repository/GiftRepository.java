package com.giftidea.repository;

import com.giftidea.model.Gift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GiftRepository extends JpaRepository<Gift, Long> {
    
    List<Gift> findByCategory(String category);
    
    List<Gift> findByIsFavoriteTrue();
    
    List<Gift> findByNameContainingIgnoreCase(String keyword);
    
    @Query("SELECT g FROM Gift g WHERE g.price <= :maxPrice")
    List<Gift> findByPriceLessThanEqual(Double maxPrice);
} 