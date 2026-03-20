package com.example.todo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.todo.dto.TodoResponse;
import com.example.todo.entity.Todo;
import com.example.todo.repository.TodoRepository;

@Service
public class TodoService {
	@Autowired
	TodoRepository todoRepo;
	
	public List<TodoResponse> getTodos() {
		List<Todo> todos = todoRepo.findAll();
		
		return todos.stream().map(TodoResponse::from).toList(); 
	}
}
