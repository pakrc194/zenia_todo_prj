package com.example.todo.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.todo.entity.Todo;

public interface TodoRepository extends JpaRepository<Todo, Long>{
	
	@Query("select t from Todo t left join fetch t.recurrences tr where :date > t.dueDate")
	List<Todo> findByDateWithRecurrences(@Param("date") LocalDate date);

}
