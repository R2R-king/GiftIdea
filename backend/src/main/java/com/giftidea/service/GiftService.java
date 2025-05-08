package com.giftidea.service;

import com.giftidea.dto.GiftDTO;

import java.util.List;

public interface GiftService {
    
    List<GiftDTO> getAllGifts();
    
    GiftDTO getGiftById(Long id);
    
    GiftDTO createGift(GiftDTO giftDTO);
    
    GiftDTO updateGift(Long id, GiftDTO giftDTO);
    
    void deleteGift(Long id);
    
    List<GiftDTO> getGiftsByCategory(String category);
    
    List<GiftDTO> getFavoriteGifts();
    
    List<GiftDTO> searchGiftsByName(String keyword);
    
    List<GiftDTO> getGiftsByMaxPrice(Double maxPrice);
    
    GiftDTO toggleFavorite(Long id);
} 