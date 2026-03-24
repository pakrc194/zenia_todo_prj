package com.example.todo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.todo.dto.TagRequest;
import com.example.todo.dto.TagResponse;
import com.example.todo.entity.Tag;
import com.example.todo.repository.TagRepository;

@Service
public class TagService {
	@Autowired
	TagRepository tagRepo;
	
	public List<TagResponse> findAll() {
		List<Tag> list = tagRepo.findAll(); 
		
		return list.stream().map(TagResponse::from).toList();
	}
	
	public int save(TagRequest dto) {
		tagRepo.save(dto.toEntity());
		return 1; 
	}
	
	public int delete(Long id) {
		tagRepo.deleteById(id);
		return 1;
	}
}
