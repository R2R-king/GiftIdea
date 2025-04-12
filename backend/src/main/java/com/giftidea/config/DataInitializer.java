package com.giftidea.config;

import com.giftidea.model.Product;
import com.giftidea.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Autowired
    public DataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            loadSampleProducts();
        }
    }

    private void loadSampleProducts() {
        List<Product> products = Arrays.asList(
            new Product(null, "Подарочный набор 'Романтика'", "Набор для романтического вечера, включающий свечи, шоколад и вино", new BigDecimal("3999.99"), "https://example.com/gift1.jpg", 50, "Романтика"),
            new Product(null, "Умные часы XWatch", "Современные смарт-часы с функцией отслеживания активности", new BigDecimal("12999.00"), "https://example.com/watch.jpg", 35, "Электроника"),
            new Product(null, "Букет из 25 роз", "Красивый букет из свежих роз", new BigDecimal("4500.00"), "https://example.com/roses.jpg", 20, "Цветы"),
            new Product(null, "Подарочный сертификат", "Подарочный сертификат на спа-процедуры", new BigDecimal("7000.00"), "https://example.com/certificate.jpg", 100, "Сертификаты"),
            new Product(null, "Ювелирный набор", "Элегантный набор из серебряных украшений", new BigDecimal("15999.99"), "https://example.com/jewelry.jpg", 15, "Украшения"),
            new Product(null, "Парфюм Deluxe", "Изысканный аромат для настоящих ценителей", new BigDecimal("8500.00"), "https://example.com/perfume.jpg", 40, "Красота"),
            new Product(null, "Шоколадный набор", "Набор эксклюзивных шоколадных конфет ручной работы", new BigDecimal("2999.00"), "https://example.com/chocolate.jpg", 60, "Сладости"),
            new Product(null, "Плюшевый медведь", "Большой плюшевый медведь (80 см)", new BigDecimal("3500.00"), "https://example.com/bear.jpg", 25, "Игрушки"),
            new Product(null, "Книга 'Лучшие истории любви'", "Сборник самых романтичных историй любви", new BigDecimal("1599.99"), "https://example.com/book.jpg", 70, "Книги"),
            new Product(null, "Подарочная корзина", "Корзина с фруктами, шампанским и сладостями", new BigDecimal("5999.00"), "https://example.com/basket.jpg", 30, "Наборы")
        );
        
        productRepository.saveAll(products);
        System.out.println("Sample products have been loaded!");
    }
} 