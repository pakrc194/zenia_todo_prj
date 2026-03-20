package com.example.todo.cors;

import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public OllamaChatModel ollamaChatModel() {
        // 1. OllamaApi 빌더 (new 생성자 없음)
        OllamaApi ollamaApi = OllamaApi.builder()
                .baseUrl("http://localhost:11434")
                .build();

        // 2. OllamaChatOptions 빌더 (사용자님이 확인하신 방식)
        // .build() 결과가 ToolCallingChatOptions이므로 명시적 형변환이 필요할 수 있습니다.
        OllamaChatOptions options = (OllamaChatOptions) OllamaChatOptions.builder()
                .model("llama3")
                .temperature(0.7)
                .build();

        // 3. OllamaChatModel 빌더 (defaultOptions 메서드 사용)
        return OllamaChatModel.builder()
                .ollamaApi(ollamaApi)
                .defaultOptions(options) // 여기서 타입을 맞추는 게 핵심입니다.
                .build();
    }
}