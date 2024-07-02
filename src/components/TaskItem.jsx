import React, { useState } from 'react';

const TaskItem = ({ task, onDelete, onComplete, onAddSubTask, isTopLevel = true }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [subTaskDescription, setSubTaskDescription] = useState('');
    const [isComplete, setIsComplete] = useState(task.isComplete);

    const handleCheckboxChange = () => {
        const newIsComplete = !isComplete;
        setIsComplete(newIsComplete);
        onComplete(task.uid, newIsComplete, isTopLevel ? null : task.parentUid);
    };

    const handleDelete = () => {
        onDelete(task.uid);
    };

    const handleAddSubTask = (e) => {
        e.preventDefault();
        const newSubTask = {
            uid: generateGUID(),
            description: subTaskDescription,
            deadlineDate: new Date().toISOString(),
            isComplete: false,
            moreDetails: '',
            subTasks: [],
        };
        const updatedTask = {
            ...task,
            subTasks: [...(task.subTasks || []), newSubTask],
        };
        fetch(`http://localhost:5154/api/taskItem/${task.uid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask),
        })
            .then(response => response.json())
            .then(() => {
                onAddSubTask(task.uid, updatedTask);
                setSubTaskDescription('');
            });
    };

    const isOverdue = isTopLevel && new Date(task.deadlineDate) < new Date();

    return (
        <div className={`task-item ${isOverdue ? 'overdue' : ''}`}>
            <input
                type="checkbox"
                checked={isComplete}
                onChange={handleCheckboxChange}
            />
            <span>{task.description}</span>

            {isTopLevel && (
                <button onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? 'Hide Details' : 'More Details'}
                </button>
            )}
            {showDetails && (
                <div className="details">
                    <p>{task.moreDetails}</p>
                </div>
            )}
            <div className="sub-tasks">
                {(task.subTasks || []).map((subTask) => (
                    <TaskItem
                        key={subTask.uid}
                        task={{ ...subTask, parentUid: task.uid }}
                        onDelete={onDelete}
                        onComplete={onComplete}
                        onAddSubTask={onAddSubTask}
                        isTopLevel={false}
                    />
                ))}
            </div>
            {isTopLevel && <button className="delete-button" onClick={handleDelete}>Delete</button>}
            {isTopLevel && (
                <form onSubmit={handleAddSubTask}>
                    <input
                        type="text"
                        value={subTaskDescription}
                        onChange={(e) => setSubTaskDescription(e.target.value)}
                        placeholder="Subtask description"
                        required
                    />
                    <button type="submit">Add Subtask</button>
                </form>
            )}
        </div>
    );
};

const generateGUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};


export default TaskItem;
