package com.example.todo.dto;

import com.example.todo.entity.Tag;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TagResponse {
	Long id;
	String name, color;
	
	public static TagResponse from(Tag tag) {
		return TagResponse.builder()
				.id(tag.getId())
				.name(tag.getName())
				.color(tag.getColor())
				.build();
	}
}
