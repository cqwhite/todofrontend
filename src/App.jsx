import React, { useState } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

const App = () => {
    const [tasks, setTasks] = useState([]);

    const handleAddTask = (newTask) => {
        setTasks([...tasks, newTask]);
    };

    return (
        <div className="App">
            <h1>Todo!</h1>
            <TaskList tasks={tasks} setTasks={setTasks} />
        </div>
    );
};

export default App;
