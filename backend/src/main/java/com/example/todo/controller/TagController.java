package com.example.todo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo.dto.TagRequest;
import com.example.todo.dto.TagResponse;
import com.example.todo.service.TagService;

@RestController
@RequestMapping("/tag")
public class TagController {
	@Autowired
	TagService tagService;
	
	
	@GetMapping("/list")
	List<TagResponse> list() {
		return tagService.findAll(); 
	}
	
	@PostMapping
	int save(@RequestBody TagRequest tag) {
		System.out.println(tag);
		return tagService.save(tag);
	}
	
	@DeleteMapping("/{id}")
	int delete(@PathVariable(name = "id") Long id) {
		return tagService.delete(id);
	}
}
