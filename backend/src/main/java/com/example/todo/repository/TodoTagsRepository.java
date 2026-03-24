package com.example.todo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.todo.entity.Tag;
import com.example.todo.entity.Todo;
import com.example.todo.entity.TodoTag;
import com.example.todo.entity.TodoTagId;

public interface TodoTagsRepository extends JpaRepository<TodoTag, TodoTagId>{
	
	List<Tag> findByTodo(Todo todo);
}
