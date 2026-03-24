package com.example.todo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.todo.dto.TagResponse;
import com.example.todo.entity.Tag;
import com.example.todo.entity.Todo;
import com.example.todo.repository.TodoTagsRepository;

@Service
public class TodoTagService {
	@Autowired
	TodoTagsRepository todoTagsRepo;
	
	List<TagResponse> findAllByTodoId(Long id) {
		Todo todo = new Todo();
		todo.setId(id);
		List<Tag> list = todoTagsRepo.findByTodo(todo);
		return list.stream().map(TagResponse::from).toList();
	}
}
