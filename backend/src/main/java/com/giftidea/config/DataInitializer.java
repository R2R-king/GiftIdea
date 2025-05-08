package com.giftidea.config;

import com.giftidea.model.Gift;
import com.giftidea.repository.GiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private GiftRepository giftRepository;

    @Override
    public void run(String... args) {
        if (giftRepository.count() == 0) {
            initGifts();
        }
    }

    private void initGifts() {
        List<Gift> gifts = Arrays.asList(
            createGift("Умные часы", "Стильные умные часы с мониторингом здоровья", "Электроника", 149.99, "https://picsum.photos/id/25/200/200", false),
            createGift("Набор для ухода за бородой", "Полный набор для ухода за бородой", "Красота", 59.99, "https://picsum.photos/id/26/200/200", false),
            createGift("Беспроводные наушники", "Наушники с шумоподавлением", "Электроника", 99.99, "https://picsum.photos/id/27/200/200", true),
            createGift("Набор для приготовления суши", "Полный набор для приготовления суши дома", "Кухня", 49.99, "https://picsum.photos/id/28/200/200", false),
            createGift("Портативная колонка", "Водонепроницаемая bluetooth-колонка", "Электроника", 79.99, "https://picsum.photos/id/29/200/200", true),
            createGift("Набор для рисования", "Профессиональный набор для рисования", "Хобби", 129.99, "https://picsum.photos/id/30/200/200", false),
            createGift("Фотоальбом", "Персонализированный фотоальбом", "Дом", 39.99, "https://picsum.photos/id/31/200/200", false),
            createGift("Коллекционная фигурка", "Коллекционная фигурка из вашего любимого сериала", "Развлечения", 89.99, "https://picsum.photos/id/32/200/200", true),
            createGift("Книга рецептов", "Книга с рецептами со всего мира", "Кухня", 29.99, "https://picsum.photos/id/33/200/200", false),
            createGift("Ароматическая свеча", "Набор ароматических свечей для релаксации", "Дом", 19.99, "https://picsum.photos/id/34/200/200", false)
        );
        
        giftRepository.saveAll(gifts);
    }
    
    private Gift createGift(String name, String description, String category, double price, String imageUrl, boolean isFavorite) {
        Gift gift = new Gift();
        gift.setName(name);
        gift.setDescription(description);
        gift.setCategory(category);
        gift.setPrice(price);
        gift.setImageUrl(imageUrl);
        gift.setFavorite(isFavorite);
        return gift;
    }
} 