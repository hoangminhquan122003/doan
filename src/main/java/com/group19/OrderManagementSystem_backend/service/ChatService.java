package com.group19.OrderManagementSystem_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.group19.OrderManagementSystem_backend.dto.request.ChatRequest;
import com.group19.OrderManagementSystem_backend.dto.response.ChatResponse;
import com.group19.OrderManagementSystem_backend.dto.response.FoodResponse;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.HttpHeaders;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatService {
    final FoodService foodService;


    RestTemplate restTemplate = new RestTemplate();
    ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.url}")
    @NonFinal
    String geminiApiUrl;

    @Value("${gemini.api.key}")
    @NonFinal
    String geminiApiKey;

    public ChatResponse processMessage(ChatRequest chatRequest) {
        try {
            List<FoodResponse> allFoods = foodService.getAll(); // <-- lấy toàn bộ món
            StringBuilder foodListText = new StringBuilder("Dưới đây là danh sách món ăn:\n");

            for (FoodResponse food : allFoods) {
                foodListText.append(String.format("- %s: %s, giá %d VND\n", food.getFoodName(), food.getDescription(), food.getFoodPrice()));
            }

            String finalPrompt = foodListText + "\nNgười dùng yêu cầu: " + chatRequest.getMessage() +
                    "\nDựa trên danh sách món ăn ở trên và yêu cầu của người dùng, hãy gợi ý các món phù hợp (có thể nhiều món), ghi cả giá món nữa, phân cách nhau bằng dấu phẩy, không cần giải thích hay tiêu đề.";

            String url = geminiApiUrl + "?key=" + geminiApiKey;

            String payload = String.format(
                    "{\"contents\": [{\"parts\": [{\"text\": \"%s\"}]}]}",
                    finalPrompt.replace("\"", "\\\"")
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> requestEntity = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                String content = jsonResponse
                        .path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text")
                        .asText();
                return ChatResponse.builder().content(content).build();
            } else {
                throw new RuntimeException("Failed to get valid response from Gemini API");
            }

        } catch (Exception e) {
            throw new RuntimeException("Error processing Gemini API request: " + e.getMessage(), e);
        }
    }

}
