package com.giftidea.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
public class ImageGenerationController {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gigachat.api.url:https://gigachat.devices.sberbank.ru/api/v1}")
    private String gigaChatApiUrl;

    @Value("${gigachat.api.key}")
    private String gigaChatApiKey;

    public ImageGenerationController(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/generate-image")
    public ResponseEntity<Map<String, String>> generateImage(@RequestBody Map<String, String> request) {
        try {
            String eventName = request.get("eventName");
            String prompt = request.get("prompt");

            if (eventName == null || prompt == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Название события и промпт обязательны"));
            }

            // Шаг 1: Получаем токен для доступа к GigaChat API
            String authToken = getAuthToken();

            // Шаг 2: Генерируем изображение через GigaChat API
            String imageId = generateImageViaGigaChat(prompt, authToken);

            // Шаг 3: Скачиваем изображение
            byte[] imageBytes = downloadImage(imageId, authToken);

            // Шаг 4: Кодируем изображение в base64
            String imageBase64 = Base64.getEncoder().encodeToString(imageBytes);

            Map<String, String> response = new HashMap<>();
            response.put("imageData", imageBase64);
            response.put("eventName", eventName);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    private String getAuthToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + gigaChatApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
            gigaChatApiUrl + "/oauth/token",
            HttpMethod.POST,
            entity,
            String.class
        );

        if (response.getStatusCode() == HttpStatus.OK) {
            try {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.get("access_token").asText();
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse auth token", e);
            }
        } else {
            throw new RuntimeException("Failed to get auth token: " + response.getStatusCode());
        }
    }

    private String generateImageViaGigaChat(String prompt, String authToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + authToken);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "GigaChat");
        
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "Ты — талантливый художник, специализирующийся на создании красивых иллюстраций для событий и праздников");
        
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        
        messages.add(systemMessage);
        messages.add(userMessage);
        
        requestBody.put("messages", messages);
        requestBody.put("function_call", "auto");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
            gigaChatApiUrl + "/chat/completions",
            HttpMethod.POST,
            entity,
            String.class
        );

        if (response.getStatusCode() == HttpStatus.OK) {
            try {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String content = jsonNode.get("choices").get(0).get("message").get("content").asText();
                
                // Извлекаем ID изображения из ответа (предполагается формат "<img src=\"uuid\" fuse=\"true\"/>")
                Pattern pattern = Pattern.compile("<img src=\"([^\"]+)\"");
                Matcher matcher = pattern.matcher(content);
                
                if (matcher.find()) {
                    return matcher.group(1);
                } else {
                    throw new RuntimeException("Image ID not found in response");
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse image generation response", e);
            }
        } else {
            throw new RuntimeException("Failed to generate image: " + response.getStatusCode());
        }
    }

    private byte[] downloadImage(String imageId, String authToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + authToken);
        headers.set("Accept", "application/jpg");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
            gigaChatApiUrl + "/files/" + imageId + "/content",
            HttpMethod.GET,
            entity,
            byte[].class
        );

        if (response.getStatusCode() == HttpStatus.OK) {
            return response.getBody();
        } else {
            throw new RuntimeException("Failed to download image: " + response.getStatusCode());
        }
    }
} 