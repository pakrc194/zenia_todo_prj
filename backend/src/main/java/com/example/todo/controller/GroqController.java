package com.example.todo.controller;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo.dto.TodoResponse;
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
    

    @GetMapping("/ai/groq")
    public String chat(
        @RequestParam(name="message",defaultValue = "안녕!") String message
    ) {
    	LocalDate date = LocalDate.now();
    	List<TodoResponse> todoRes= todoService.findByDateTodos(date);
    	System.out.println(todoRes.toString());
    	String res = groqService.chat(todoRes.toString()+"/"+message);
    	System.out.println(message+" : "+ res);
    	
        return res;
    }
}