package com.example.todo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.todo.dto.CategoryDto;
import com.example.todo.entity.Category;
import com.example.todo.repository.CategoryRepository;

@Service
public class CategoryService {
	@Autowired
	CategoryRepository categoryRepo;
	
	public List<CategoryDto> findAll() {
		List<Category> list = categoryRepo.findAll();
		
		return list.stream().map(CategoryDto::from).toList();
	}
	
	public int save(CategoryDto dto) {
		categoryRepo.save(dto.toEntity());
		return 1;
	}
	
	public int delete(Long id) {
		categoryRepo.deleteById(id);
		return 1;
	}
}
