import React, { useState, useEffect } from 'react';
import { v4 } from 'uuid';

const TaskItem = ({ task, onDelete, onDeleteSubTask, onComplete, onAddSubTask, isTopLevel = true }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [subTaskDescription, setSubTaskDescription] = useState('');
    const [subTaskMoreDetails, setSubTaskMoreDetails] = useState('');
    const [isComplete, setIsComplete] = useState(task.isComplete);

    useEffect(() => {
        setIsComplete(task.isComplete);
    }, [task.isComplete]);

    const handleCheckboxChange = () => {
        const newIsComplete = !isComplete;
        setIsComplete(newIsComplete);
        onComplete(task.uid, newIsComplete, isTopLevel ? null : task.parentUid);
    };

    const handleDelete = () => {
        onDelete(task.uid);
    };

    const handleDeleteSubTask = () => {
        onDeleteSubTask(task.uid, task.parentUid);
    };

    const handleAddSubTask = (e) => {
        e.preventDefault();
        const newSubTask = {
            uid: v4(),
            description: subTaskDescription,
            deadlineDate: new Date().toISOString(),
            isComplete: false,
            moreDetails: subTaskMoreDetails,
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
                className="checkbox"
                checked={isComplete}
                onChange={handleCheckboxChange}
            />
            <span>{task.description}</span>
            <button onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? 'Hide Details' : 'More Details'}
            </button>
            {showDetails && (
                <div className="details">
                    <p>{task.moreDetails}</p>
                </div>
            )}
            <div className="sub-tasks">
                {(task.subTasks || []).map((subTask) => (
                    <TaskItem
                        key={subTask.uid}
                        task={{...subTask, parentUid: task.uid}}
                        onDeleteSubTask={onDeleteSubTask}
                        onComplete={onComplete}
                        onAddSubTask={onAddSubTask}
                        isTopLevel={false}
                    />
                ))}
            </div>
            {!isTopLevel && <button className="delete-button" onClick={handleDeleteSubTask}>Delete</button>}
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
                    <input
                        type="text"
                        value={subTaskMoreDetails}
                        onChange={(e) => setSubTaskMoreDetails(e.target.value)}
                        placeholder="Subtask moreDetails"
                        required
                    />
                    <button type="submit">Add Subtask</button>
                </form>
            )}
        </div>
    );
};

export default TaskItem;
