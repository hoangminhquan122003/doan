package com.group19.OrderManagementSystem_backend.controller;

import com.group19.OrderManagementSystem_backend.dto.request.ChatRequest;
import com.group19.OrderManagementSystem_backend.dto.response.ChatResponse;
import com.group19.OrderManagementSystem_backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest chatRequest) {
        ChatResponse response = chatService.processMessage(chatRequest);
        return ResponseEntity.ok(response);
    }
}
