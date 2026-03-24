package com.example.todo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.todo.entity.Tag;

public interface TagRepository extends JpaRepository<Tag, Long>{

}
