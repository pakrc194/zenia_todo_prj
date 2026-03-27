package com.example.todo.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name="todos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Todo {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	
	String title, description;
	
	boolean isDone;
	
	@Enumerated(EnumType.STRING)
	Priority priority;
	
	@CreatedDate
	LocalDateTime createdAt;
	LocalDate dueDate;
	
	@ManyToOne(fetch=FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	@JoinColumn(name="recurrence_id")
	Recurrence recurrence;
	
	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="category_id")
	Category category;
	
	
    @OneToMany(mappedBy = "todo", cascade = CascadeType.ALL, orphanRemoval = true)
	List<TodoTag> todoTags;
	
    
	// Tag 목록이 필요할 때 꺼내는 편의 메서드
	public List<Tag> getTags() {
	    return todoTags.stream()
	            .map(TodoTag::getTag)
	            .toList();
	}
	
	public void setTags(List<Tag> reqTags) {
		if (reqTags == null) {
	        this.todoTags.clear();
	        return;
	    } 
		
		if(this.todoTags==null) {
			this.todoTags = new ArrayList<>();
		}

	    // 1. 제거 대상 삭제: 요청에 없는 기존 태그들을 리스트에서 제거 (orphanRemoval에 의해 DB에서도 삭제됨)
		if(this.todoTags!=null && this.todoTags.size()>0) {
		    this.todoTags.removeIf(existingTodoTag -> 
		        reqTags.stream().noneMatch(tag -> tag.getId().equals(existingTodoTag.getTag().getId()))
		    );
		}

	    // 2. 신규 대상 추가: 기존에 없던 태그들만 새로운 TodoTag 객체로 만들어 추가
	    for (Tag tag : reqTags) {
	    	boolean isAlreadyPresent = false;
	    	if(this.todoTags!=null && this.todoTags.size()>0) {
	    		isAlreadyPresent = this.todoTags.stream()
	    	            .anyMatch(existingTodoTag -> existingTodoTag.getTag().getId().equals(tag.getId()));
	    	}

	        if (!isAlreadyPresent) {
	            TodoTag newTodoTag = new TodoTag();
	            newTodoTag.setTodo(this);
	            newTodoTag.setTag(tag);
	            this.todoTags.add(newTodoTag);
	        }
	    }
	}
	
	
}
