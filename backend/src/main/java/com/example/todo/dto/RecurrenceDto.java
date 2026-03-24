package com.example.todo.dto;

import java.time.LocalDate;

import com.example.todo.entity.Recurrence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class RecurrenceDto {
	LocalDate endDate;
	String type, daysOfWeek;
	
	public static RecurrenceDto from(Recurrence recur) {
		return new RecurrenceDto(
				recur.getEndDate(),
				recur.getType(),
				recur.getDaysOfWeek()
				);
	}
	
	public Recurrence toEntity() {
		return Recurrence.builder()
				.endDate(this.endDate)
				.type(this.type)
				.daysOfWeek(this.daysOfWeek)
				.build();
	}
}
