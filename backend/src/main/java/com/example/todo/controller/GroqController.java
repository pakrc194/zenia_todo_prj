package com.example.todo.controller;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo.dto.ChatDto;
import com.example.todo.dto.TodoDto;
import com.example.todo.service.GroqService;
import com.example.todo.service.TodoService;

@RestController
public class GroqController {

    private final GroqService groqService;

    public GroqController(GroqService groqService) {
        this.groqService = groqService;
    }
    
    @Autowired
    TodoService todoService;
    

    @PostMapping("/ai/groq")
    public String chat(
        @RequestBody ChatDto dto
    ) {
    	LocalDate date = LocalDate.now();
    	List<TodoDto> todoRes= todoService.findByDateTodos(date);
    	String res = groqService.chat(todoRes.toString()+"/"+dto.getMessage());
    	System.out.println(dto.getMessage()+" : "+ res);
    	
        return res;
    }
}