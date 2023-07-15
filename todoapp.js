document.addEventListener('DOMContentLoaded', function() {
    const taskList = document.getElementById('taskList');
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');

    // Function to create a new task list item
    function createTaskListItem(task) {
        const li = document.createElement('li');
        li.innerText = task.title;
        li.classList.add(task.completed ? 'completed' : '');

        // Toggle the task completion status on click
        li.addEventListener('click', function() {
            task.completed = !task.completed;
            li.classList.toggle('completed');
            updateTask(task);
        });

        // Append the delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', function(event) {
            event.stopPropagation();
            deleteTask(task.id);
        });
        li.appendChild(deleteButton);

        return li;
    }

    // Function to fetch all tasks from the backend
    function fetchTasks() {
        fetch('/api/tasks')
            .then(response => response.json())
            .then(tasks => {
                // Clear existing task list
                taskList.innerHTML = '';

                // Create task list items for each task
                tasks.forEach(task => {
                    const li = createTaskListItem(task);
                    taskList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }

    // Function to add a new task
    function addTask() {
        const title = taskInput.value.trim();
        if (title === '') {
            return;
        }

        const task = {
            title: title,
            completed: false
        };

        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        })
            .then(response => response.json())
            .then(newTask => {
                const li = createTaskListItem(newTask);
                taskList.appendChild(li);
                taskInput.value = '';
            })
            .catch(error => {
                console.error('Error adding task:', error);
            });
    }

    // Function to update a task
    function updateTask(task) {
        fetch(`/api/tasks/${task.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        })
            .then(response => response.json())
            .then(updatedTask => {
                // Update the task object with the response
                Object.assign(task, updatedTask);
            })
            .catch(error => {
                console.error('Error updating task:', error);
            });
    }

    // Function to delete a task
    function deleteTask(taskId) {
        fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(result => {
                if (result.message === 'Task deleted') {
                    const li = taskList.querySelector(`[data-task-id="${taskId}"]`);
                    if (li) {
                        li.remove();
                    }
                }
            })
            .catch(error => {
                console.error('Error deleting task:', error);
            });
    }

    // Event listener for the add task button
    addTaskButton.addEventListener('click', addTask);

    // Fetch all tasks on page load
    fetchTasks();
});
