package com.example.todo.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo.dto.TodoDto;
import com.example.todo.service.TodoService;

@RestController
@RequestMapping("/todo")
public class TodoController {
	@Autowired
	TodoService todoService;
	
	@GetMapping("/today")
	List<TodoDto> todos(@RequestParam(name="date") LocalDate date) {
		System.out.println(date);
		List<TodoDto> list = todoService.findByDateTodos(date); 
		
		return list;
	}
	
	@GetMapping("/month")
	List<TodoDto> month(@RequestParam(name="date") LocalDate date) {
		System.out.println(date);
		List<TodoDto> list = todoService.findByMonthTodos(date); 
		
		return list;
	}
	
	@PostMapping
	TodoDto save(@RequestBody TodoDto todo) {
		System.out.println("post : "+ todo);
		
		return todoService.save(todo);
	}
	
	@PatchMapping("/{id}")
	TodoDto patch(@PathVariable(name="id") Long id, @RequestBody TodoDto todo) {
		todo.setId(id);
		
		System.out.println("path : "+todo);
		//return null;
		return todoService.patch(todo);
	}
	
	@PatchMapping("/{id}/done")
	TodoDto isDone(@PathVariable(name="id") Long id, @RequestBody TodoDto todo) {
		todo.setId(id);
		
		System.out.println("isDone : "+todo);
		return null;
		//return todoService.isDone(todo);
	}
}
