package com.example.todo.dto;

import java.time.LocalDateTime;

import com.example.todo.entity.Category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
	
	Long id;
	String name, color;
	LocalDateTime createdAt;
	
	public static CategoryDto from(Category category) {
		return CategoryDto.builder()
				.id(category.getId())
				.name(category.getName())
				.color(category.getColor())
				.build();
	}
	
	public Category toEntity() {
		return Category.builder()
				.name(this.name)
				.color(this.color)
				.createdAt(this.createdAt)
				.build();
	}
}
