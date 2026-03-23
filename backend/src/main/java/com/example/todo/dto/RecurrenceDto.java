package com.example.todo.dto;

import java.time.LocalDate;

import com.example.todo.entity.Recurrences;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RecurrenceDto {
	LocalDate endDate;
	String type, daysOfWeek;
	
	public static RecurrenceDto from(Recurrences recur) {
		return new RecurrenceDto(
				recur.getEndDate(),
				recur.getType(),
				recur.getDaysOfWeek()
				);
	}
}
