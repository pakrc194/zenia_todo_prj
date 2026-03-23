package com.example.todo.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo.dto.TodoResponse;
import com.example.todo.service.TodoService;

@RestController
@RequestMapping("/todo")
public class TodoController {
	@Autowired
	TodoService todoService;
	
	@GetMapping("/list")
	List<TodoResponse> todos(@RequestParam(name="date") LocalDate date) {
		System.out.println(date);
		List<TodoResponse> list = todoService.findByDateTodos(date); 
		
		return list;
	}
}
