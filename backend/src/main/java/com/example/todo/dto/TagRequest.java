package com.example.todo.dto;

import java.time.LocalDateTime;

import com.example.todo.entity.Tag;
import com.example.todo.entity.Todo;

import lombok.Data;

@Data
public class TagRequest {
	Long id;
	String name, color;
	LocalDateTime createdAt;
	
	public Tag toEntity() {
		return Tag.builder()
				.name(this.name)
				.color(this.color)
				.build();
	}
}
