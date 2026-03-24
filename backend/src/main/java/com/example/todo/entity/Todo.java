package com.example.todo.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name="todos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Todo {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	
	String title, description;
	
	boolean isDone;
	
	@Enumerated(EnumType.STRING)
	Priority priority;
	
	LocalDateTime createdAt;
	LocalDate dueDate;
	
	@ManyToOne(fetch=FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	@JoinColumn(name="recurrence_id")
	Recurrence recurrence;
	
	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="category_id")
	Category category;
	
	
    @OneToMany(mappedBy = "todo", cascade = CascadeType.ALL, orphanRemoval = true)
	List<TodoTag> todoTags;
	
    
	// Tag 목록이 필요할 때 꺼내는 편의 메서드
	public List<Tag> getTags() {
	    return todoTags.stream()
	            .map(TodoTag::getTag)
	            .toList();
	}
	
	public void addTag(List<Tag> req) {
		List<TodoTag> list = new ArrayList<>();
		for(Tag tag : req) {
			TodoTag todoTag = new TodoTag();
			todoTag.setTodo(this);
			todoTag.setTag(tag);
			list.add(todoTag);
		}
		this.todoTags = new ArrayList<>(list);
	}
}
