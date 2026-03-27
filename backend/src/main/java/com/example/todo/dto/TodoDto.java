package com.example.todo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.todo.entity.Category;
import com.example.todo.entity.Priority;
import com.example.todo.entity.Recurrence;
import com.example.todo.entity.Tag;
import com.example.todo.entity.Todo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class TodoDto {
	Long id;
	String title, description, priority;
	boolean isDone;
	LocalDate dueDate;
	RecurrenceDto recurrence;
	LocalDateTime createdAt;
	CategoryDto category;
	List<Tag> tags;
	
	Long categoryId;
	List<Long> tagIds; 
	
	
	public static TodoDto from(Todo todo) {
		return TodoDto.builder()
		.id(todo.getId())
		.title(todo.getTitle())
		.description(todo.getDescription())
		.priority(todo.getPriority().toString())
		.isDone(todo.isDone())
		.dueDate(todo.getDueDate())
		.recurrence(todo.getRecurrence()!=null?
				RecurrenceDto.from(todo.getRecurrence()) :null)
		.createdAt(todo.getCreatedAt())
		.category(todo.getCategory()!=null?CategoryDto.from(todo.getCategory()):null)
		.tags(todo.getTags())
		.build();
		
		
	}
	
	public Todo toEntity(Category category) {
		return Todo.builder()
				.title(this.title)
				.description(this.description)
				.priority(Priority.valueOf(this.priority))
				.isDone(false)
				.dueDate(this.dueDate)
				.recurrence(this.recurrence!=null?this.recurrence.toEntity():null)
				.createdAt(this.createdAt)
				.category(category!=null? category : null)
				.build();
	}
}
