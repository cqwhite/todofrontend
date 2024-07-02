import React, { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5154/api/taskItem')
            .then(response => response.json())
            .then(data => {
                const initializedTasks = data.map(task => ({
                    ...task,
                    subTasks: task.subTasks || [],
                }));
                setTasks(initializedTasks);
            });
    }, []);

    const handleDelete = (uid) => {
        fetch(`http://localhost:5154/api/taskItem/${uid}`, { method: 'DELETE' })
            .then(() => setTasks(tasks.filter(task => task.uid !== uid)));
    };

    const handleDeleteSubTask = (uid, parentUid) => {
        const parentTask = tasks.find(task => task.uid === parentUid);
        parentTask.subTasks = parentTask.subTasks.filter(subTask => subTask.uid !== uid)
        fetch(`http://localhost:5154/api/taskItem/${parentUid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parentTask),
        })
            .then(response => response.json())
            .then(updatedParentTask => {
                handleTaskChange(parentUid, updatedParentTask.result);
            });

    }

    const handleComplete = (uid, isComplete, parentUid = null) => {
        if (parentUid) {
            const parentTask = tasks.find(task => task.uid === parentUid);
            if (parentTask) {
                const updatedSubTasks = parentTask.subTasks.map(subTask =>
                    subTask.uid === uid ? { ...subTask, isComplete } : subTask
                );
                const updatedParentTask = { ...parentTask, subTasks: updatedSubTasks };
                fetch(`http://localhost:5154/api/taskItem/${parentUid}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedParentTask),
                })
                    .then(response => response.json())
                    .then(updatedParentTask => {
                        console.log('Updated Parent Task:', updatedParentTask.result);
                        handleTaskChange(parentUid, updatedParentTask.result);
                    });
            }
        } else {
            const taskToUpdate = tasks.find(task => task.uid === uid);
            if (taskToUpdate) {
                const updatedTask = { ...taskToUpdate, isComplete };
                fetch(`http://localhost:5154/api/taskItem/${uid}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedTask),
                })
                    .then(response => response.json())
                    .then(updatedTaskItem => {
                        console.log('Updated Task:', updatedTaskItem);
                        handleTaskChange(uid, updatedTaskItem.result);
                    });
            }
        }
    };

    const handleTaskChange = (uid, updatedTask) => {
        setTasks(tasks.map(task => (task.uid === uid ? updatedTask : task)));
    };


    const handleAddTask = (newTask) => {
        setTasks([...tasks, newTask]);
    };

    return (
        <div className="task-list">
            <TaskForm onAddTask={handleAddTask} />
            {tasks.map(task => (
                <TaskItem
                    key={task.uid}
                    task={task}
                    onDelete={handleDelete}
                    onDeleteSubTask={handleDeleteSubTask}
                    onComplete={handleComplete}
                    onAddSubTask={handleTaskChange}
                    isTopLevel={true}
                />
            ))}
        </div>
    );
};

export default TaskList;
