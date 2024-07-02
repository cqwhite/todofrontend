import React, { useState } from 'react';

const TaskForm = ({ onAddTask }) => {
    const [description, setDescription] = useState('');
    const [deadlineDate, setDeadlineDate] = useState('');
    const [moreDetails, setMoreDetails] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTask = {
            description,
            deadlineDate,
            isComplete: false,
            moreDetails,
            subTasks: [],
        };
        fetch('http://localhost:5154/api/taskItem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask),
        })
            .then(response => response.json())
            .then(task => {
                onAddTask(task);
                setDescription('');
                setDeadlineDate('');
                setMoreDetails('');
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                required
            />
            <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                required
            />
            <textarea
                value={moreDetails}
                onChange={(e) => setMoreDetails(e.target.value)}
                placeholder="More details"
            />
            <button type="submit">Add Task</button>
        </form>
    );
};

export default TaskForm;