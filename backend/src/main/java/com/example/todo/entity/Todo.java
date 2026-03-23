package com.example.todo.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Table(name="todos")
@Getter
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
	
	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="recurrence_id")
	Recurrences recurrences;
	
	int categoryId;
}
