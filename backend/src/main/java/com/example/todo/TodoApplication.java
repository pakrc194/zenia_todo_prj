package com.example.todo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class TodoApplication {

	public static void main(String[] args) {
		System.out.println("Working dir: " + System.getProperty("user.dir"));
		
		SpringApplication app = new SpringApplication(TodoApplication.class);
        ConfigurableApplicationContext ctx = app.run(args);
		
		Environment env = ctx.getEnvironment();
        System.out.println("▶ DB_URL  : " + env.getProperty("DB_URL"));
        System.out.println("▶ DB_USER : " + env.getProperty("DB_USER"));
        System.out.println("▶ DB_PW   : " + env.getProperty("DB_PW"));
	}
}
