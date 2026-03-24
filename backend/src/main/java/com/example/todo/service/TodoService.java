package com.example.todo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.todo.dto.TodoDto;
import com.example.todo.entity.Category;
import com.example.todo.entity.Recurrence;
import com.example.todo.entity.Tag;
import com.example.todo.entity.Todo;
import com.example.todo.entity.TodoTag;
import com.example.todo.repository.CategoryRepository;
import com.example.todo.repository.RecurrenceRepository;
import com.example.todo.repository.TagRepository;
import com.example.todo.repository.TodoRepository;
import com.example.todo.repository.TodoTagsRepository;

import jakarta.transaction.Transactional;

@Service
public class TodoService {
	@Autowired
	TodoRepository todoRepo;
	
	@Autowired
	TodoTagsRepository todoTagsRepo;
	@Autowired
	RecurrenceRepository recurRepo;
	@Autowired
	CategoryRepository cateRepo;
	@Autowired
	TagRepository tagRepo;
	
	public List<TodoDto> getTodos() {
		List<Todo> todos = todoRepo.findAll();
		return todos.stream().map(TodoDto::from).toList(); 
	}
	
	public List<TodoDto> findByDateTodos(LocalDate date) {
		List<Todo> todos = todoRepo.findByDateWithRecurrences(date);
		
		return todos.stream().map(TodoDto::from).toList(); 
	}
	public List<TodoDto> findByMonthTodos(LocalDate date) {
		List<Todo> todos = todoRepo.findByMonthWithRecurrences(date);
		
		return todos.stream().map(TodoDto::from).toList(); 
	}
	
	@Transactional
	public int save(TodoDto todo) {
		Category cate = cateRepo.findById(todo.getCategoryId()).orElse(null);
		
		
		
		Todo entity = todo.toEntity(cate);
		
		List<Tag> tags = tagRepo.findAllById(todo.getTagIds());
		entity.addTag(tags);
		entity.setCreatedAt(LocalDateTime.now());
		System.out.println(entity);
		todoRepo.save(entity);
		
		return 1;
	}
}
