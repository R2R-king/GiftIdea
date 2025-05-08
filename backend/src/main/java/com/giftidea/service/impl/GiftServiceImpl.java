package com.giftidea.service.impl;

import com.giftidea.dto.GiftDTO;
import com.giftidea.model.Gift;
import com.giftidea.repository.GiftRepository;
import com.giftidea.service.GiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GiftServiceImpl implements GiftService {

    @Autowired
    private GiftRepository giftRepository;

    @Override
    public List<GiftDTO> getAllGifts() {
        return giftRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public GiftDTO getGiftById(Long id) {
        Gift gift = giftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Gift not found with id: " + id));
        return convertToDTO(gift);
    }

    @Override
    @Transactional
    public GiftDTO createGift(GiftDTO giftDTO) {
        Gift gift = convertToEntity(giftDTO);
        Gift savedGift = giftRepository.save(gift);
        return convertToDTO(savedGift);
    }

    @Override
    @Transactional
    public GiftDTO updateGift(Long id, GiftDTO giftDTO) {
        Gift existingGift = giftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Gift not found with id: " + id));
        
        updateGiftFromDTO(existingGift, giftDTO);
        Gift updatedGift = giftRepository.save(existingGift);
        return convertToDTO(updatedGift);
    }

    @Override
    @Transactional
    public void deleteGift(Long id) {
        if (!giftRepository.existsById(id)) {
            throw new IllegalArgumentException("Gift not found with id: " + id);
        }
        giftRepository.deleteById(id);
    }

    @Override
    public List<GiftDTO> getGiftsByCategory(String category) {
        return giftRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GiftDTO> getFavoriteGifts() {
        return giftRepository.findByIsFavoriteTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GiftDTO> searchGiftsByName(String keyword) {
        return giftRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GiftDTO> getGiftsByMaxPrice(Double maxPrice) {
        return giftRepository.findByPriceLessThanEqual(maxPrice).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GiftDTO toggleFavorite(Long id) {
        Gift gift = giftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Gift not found with id: " + id));
        
        gift.setFavorite(!gift.isFavorite());
        Gift updatedGift = giftRepository.save(gift);
        return convertToDTO(updatedGift);
    }

    private GiftDTO convertToDTO(Gift gift) {
        return new GiftDTO(
                gift.getId(),
                gift.getName(),
                gift.getDescription(),
                gift.getCategory(),
                gift.getPrice(),
                gift.getImageUrl(),
                gift.isFavorite()
        );
    }

    private Gift convertToEntity(GiftDTO giftDTO) {
        Gift gift = new Gift();
        updateGiftFromDTO(gift, giftDTO);
        return gift;
    }

    private void updateGiftFromDTO(Gift gift, GiftDTO giftDTO) {
        gift.setName(giftDTO.name());
        gift.setDescription(giftDTO.description());
        gift.setCategory(giftDTO.category());
        gift.setPrice(giftDTO.price());
        gift.setImageUrl(giftDTO.imageUrl());
        gift.setFavorite(giftDTO.isFavorite());
    }
} 