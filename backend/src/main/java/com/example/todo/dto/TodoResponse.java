package com.example.todo.dto;

import java.time.LocalDateTime;

import com.example.todo.entity.Todo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TodoResponse {
	Long id;
	String title, description, priority;
	boolean isDone;
	LocalDateTime createdAt;
	
	public static TodoResponse from(Todo todo) {
		return new TodoResponse(
				todo.getId(),
				todo.getTitle(),
				todo.getDescription(),
				todo.getPriority().toString(),
				todo.isDone(),
				todo.getCreatedAt()
		);
	}
}
