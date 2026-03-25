package com.example.todo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.todo.dto.RecurrenceDto;
import com.example.todo.dto.TodoDto;
import com.example.todo.entity.Category;
import com.example.todo.entity.Priority;
import com.example.todo.entity.Recurrence;
import com.example.todo.entity.Tag;
import com.example.todo.entity.Todo;
import com.example.todo.entity.TodoTag;
import com.example.todo.repository.CategoryRepository;
import com.example.todo.repository.RecurrenceRepository;
import com.example.todo.repository.TagRepository;
import com.example.todo.repository.TodoRepository;
import com.example.todo.repository.TodoTagsRepository;

import jakarta.persistence.EntityNotFoundException;
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
	public TodoDto save(TodoDto todo) {
		Category cate = cateRepo.findById(todo.getCategoryId()).orElse(null);

		Todo entity = todo.toEntity(cate);
		
		List<Tag> tags = tagRepo.findAllById(todo.getTagIds());
		entity.setTags(tags);
		entity.setCreatedAt(LocalDateTime.now());
		System.out.println(entity);
		
		return TodoDto.from(todoRepo.save(entity));
	}
	
	@Transactional
	public TodoDto patch(TodoDto todo) {
		Todo entity = todoRepo.findById(todo.getId()).orElseThrow(()-> new EntityNotFoundException("Todo not found"));
		Category category = cateRepo.getReferenceById(todo.getCategoryId());
		List<Tag> tags = tagRepo.findAllById(todo.getTagIds());
		entity.setTags(tags);
		entity.setCategory(category);
		entity.setTitle(todo.getTitle());
		entity.setDescription(todo.getDescription());
		entity.setDueDate(todo.getDueDate());
		entity.setPriority(Priority.valueOf(todo.getPriority()));
		entity.setRecurrence(todo.getRecurrence().toEntity());
		
		
		return TodoDto.from(entity);
	}
	
	@Transactional
	public TodoDto isDone(TodoDto todo) {
		Todo entity = todoRepo.findById(todo.getId()).orElseThrow(()-> new EntityNotFoundException("Todo not found"));
		entity.setDone(todo.isDone());
		
		return TodoDto.from(entity);
	}
}
