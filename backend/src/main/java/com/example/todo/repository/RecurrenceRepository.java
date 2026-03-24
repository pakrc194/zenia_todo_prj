package com.example.todo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.todo.entity.Category;
import com.example.todo.entity.Recurrence;

public interface RecurrenceRepository extends JpaRepository<Recurrence, Long>{

}
