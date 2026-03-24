package com.example.todo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name="todo_tags")
@IdClass(TodoTagId.class)
public class TodoTag {
	@Id
	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name = "todo_id")
	Todo todo;
	
	@Id
	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="tag_id")
	Tag tag;
	
	public static TodoTag of(Todo todo, Tag tag) {
		TodoTag todoTag = new TodoTag();
		todoTag.todo = todo;
		todoTag.tag = tag;
		return todoTag;
	}
	
}
