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

import com.example.todo.dto.CategoryDto;
import com.example.todo.service.CategoryService;

@RestController
@RequestMapping("/category")
public class CategoryController {

	@Autowired
	CategoryService cateService;
	
	@GetMapping("/list")
	List<CategoryDto> findAll() {
		return cateService.findAll();
	}
	
	@PostMapping
	int save(@RequestBody CategoryDto dto) {
		return cateService.save(dto);
	}
	
	@DeleteMapping("/{id}")
	int delete(@PathVariable(name="id") Long id) {
		return cateService.delete(id);
	}
}
