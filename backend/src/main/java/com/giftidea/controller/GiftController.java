package com.giftidea.controller;

import com.giftidea.dto.ApiResponse;
import com.giftidea.dto.GiftDTO;
import com.giftidea.service.GiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gifts")
public class GiftController {

    @Autowired
    private GiftService giftService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GiftDTO>>> getAllGifts() {
        try {
            List<GiftDTO> gifts = giftService.getAllGifts();
            return new ResponseEntity<>(ApiResponse.success(gifts), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GiftDTO>> getGiftById(@PathVariable Long id) {
        try {
            GiftDTO gift = giftService.getGiftById(id);
            return new ResponseEntity<>(ApiResponse.success(gift), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GiftDTO>> createGift(@RequestBody GiftDTO giftDTO) {
        try {
            GiftDTO createdGift = giftService.createGift(giftDTO);
            return new ResponseEntity<>(ApiResponse.success("Gift created successfully", createdGift), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GiftDTO>> updateGift(@PathVariable Long id, @RequestBody GiftDTO giftDTO) {
        try {
            GiftDTO updatedGift = giftService.updateGift(id, giftDTO);
            return new ResponseEntity<>(ApiResponse.success("Gift updated successfully", updatedGift), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGift(@PathVariable Long id) {
        try {
            giftService.deleteGift(id);
            return new ResponseEntity<>(ApiResponse.success("Gift deleted successfully", null), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<GiftDTO>>> getGiftsByCategory(@PathVariable String category) {
        try {
            List<GiftDTO> gifts = giftService.getGiftsByCategory(category);
            return new ResponseEntity<>(ApiResponse.success(gifts), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<GiftDTO>>> getFavoriteGifts() {
        try {
            List<GiftDTO> gifts = giftService.getFavoriteGifts();
            return new ResponseEntity<>(ApiResponse.success(gifts), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<GiftDTO>>> searchGiftsByName(@RequestParam String keyword) {
        try {
            List<GiftDTO> gifts = giftService.searchGiftsByName(keyword);
            return new ResponseEntity<>(ApiResponse.success(gifts), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/price")
    public ResponseEntity<ApiResponse<List<GiftDTO>>> getGiftsByMaxPrice(@RequestParam Double maxPrice) {
        try {
            List<GiftDTO> gifts = giftService.getGiftsByMaxPrice(maxPrice);
            return new ResponseEntity<>(ApiResponse.success(gifts), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<GiftDTO>> toggleFavorite(@PathVariable Long id) {
        try {
            GiftDTO updatedGift = giftService.toggleFavorite(id);
            return new ResponseEntity<>(ApiResponse.success("Favorite status toggled", updatedGift), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 