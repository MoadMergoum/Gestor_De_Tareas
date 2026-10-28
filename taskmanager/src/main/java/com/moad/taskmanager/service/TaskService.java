package com.moad.taskmanager.service;

import com.moad.taskmanager.model.Task;
import com.moad.taskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public List<Task> findAll() {
        return repository.findAll();
    }

    public Optional<Task> findById(Long id) {
        return repository.findById(id);
    }

    public Task create(Task task) {
        return repository.save(task);
    }

    public Optional<Task> update(Long id, Task data) {
        return repository.findById(id).map(task -> {
            task.setTitle(data.getTitle());
            task.setDescription(data.getDescription());
            task.setDueDate(data.getDueDate());
            task.setCompleted(data.isCompleted());
            return repository.save(task);
        });
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }
}
