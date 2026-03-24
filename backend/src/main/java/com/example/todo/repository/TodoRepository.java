package com.example.todo.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.todo.entity.Todo;

public interface TodoRepository extends JpaRepository<Todo, Long>{
	
	@Query("select t from Todo t left join fetch t.recurrence tr join fetch t.category where :date >= t.dueDate")
	List<Todo> findByDateWithRecurrences(@Param("date") LocalDate date);

	
	@Query("""
			select DISTINCT t from Todo t 
			left join fetch t.recurrence tr 
			join fetch t.category 
			join fetch t.todoTags tt
			join fetch tt.tag
			where Month(:date) = Month(t.dueDate)
			""")
	List<Todo> findByMonthWithRecurrences(@Param("date") LocalDate date);
	
	@Query("""
		    SELECT DISTINCT t FROM Todo t
		    LEFT JOIN FETCH t.todoTags tt
		    LEFT JOIN FETCH tt.tag
		""")
		List<Todo> findAllWithTags();
	
}
