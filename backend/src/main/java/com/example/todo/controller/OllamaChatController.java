package com.example.todo.controller;

import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class OllamaChatController {

    // ChatClient 대신 OllamaChatModel을 직접 주입받습니다.
    private final OllamaChatModel chatModel;

    public OllamaChatController(OllamaChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @GetMapping("/ai/ollama")
    public String chat(@RequestParam(value = "message", required = false, defaultValue = "안녕!") String message) {
        return chatModel.call(message);
    }
}