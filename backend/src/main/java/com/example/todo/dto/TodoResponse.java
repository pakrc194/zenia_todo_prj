package com.example.todo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.todo.entity.Todo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class TodoResponse {
	Long id;
	String title, description, priority;
	boolean isDone;
	LocalDate dueDate;
	RecurrenceDto recurrence;
	LocalDateTime created_at;
	int category_id;
	
	
	public static TodoResponse from(Todo todo) {
		return TodoResponse.builder()
		.id(todo.getId())
		.title(todo.getTitle())
		.description(todo.getDescription())
		.priority(todo.getPriority().toString())
		.isDone(todo.isDone())
		.dueDate(todo.getDueDate())
		.recurrence(todo.getRecurrences()!=null?
				RecurrenceDto.from(todo.getRecurrences()) :null)
		.createdAt(todo.getCreatedAt())
		.categoryId(todo.getCategoryId())
		.build();
		
		
	}
}
