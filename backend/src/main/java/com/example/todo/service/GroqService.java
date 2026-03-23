package com.example.todo.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import jakarta.annotation.PostConstruct;

@Service
public class GroqService {

    @Value("${groq.api-key}")
    private String apiKey;

    @Value("${groq.model}")
    private String model;

    @Value("${groq.system-prompt-path}")
    private Resource systemPromptResource;

    private String systemPrompt;   // 파일에서 읽은 프롬프트 저장
    private RestClient restClient;

    @PostConstruct
    public void init() throws IOException {
        // restClient 초기화
        this.restClient = RestClient.builder()
            .baseUrl("https://api.groq.com/openai/v1")
            .defaultHeader("Authorization", "Bearer " + apiKey)
            .defaultHeader("Content-Type", "application/json")
            .build();

        // 파일에서 시스템 프롬프트 읽기
        this.systemPrompt = systemPromptResource
            .getContentAsString(StandardCharsets.UTF_8);
    }

    // 기본 시스템 프롬프트 사용
    public String chat(String message) {
        return chat(systemPrompt, message);
    }

    // 커스텀 시스템 프롬프트 사용
    public String chat(String systemPrompt, String message) {
        Map<String, Object> body = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", message)
            )
        );

        Map response = restClient.post()
            .uri("/chat/completions")
            .body(body)
            .retrieve()
            .body(Map.class);

        List<Map> choices = (List<Map>) response.get("choices");
        Map msg = (Map) choices.get(0).get("message");
        return (String) msg.get("content");
    }
}
