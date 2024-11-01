const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTodos = async (req, res) => {
    try {
        const todos = await prisma.todo.findMany(); // find all todo items in the database
        
        if(!todos || todos.length === 0) {
           return res.status(404).json({ message: 'No todos found' });
        }

        return res.status(200).json({ data: todos });
    }
    catch (error) {
        console.error('Error fetching todos:', error);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
}


const createTodo = async (req, res) => {
    try {
        const { title, description } = req.body;

        if(!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        const newTodo = await prisma.todo.create({
            data: {
                title,
                description,
                completed: false,  // Default value for completed is false
            }
        });

        return res.status(201).json({  data: newTodo });
    }
    catch (error) {
        console.error('Error creating todo:', error);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
}


const updateTodo = async (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    
    try {

        // find the todo item to update
        const todo = await prisma.todo.findUnique({
            where: {id: id}
        })

        if(!todo) {
            return res.status(404).json({ success: false, message: 'Todo not found' });
        }

        const updatedTodo = await prisma.todo.update({
            where: {
                id: id,
            },
            data: {
                title: title || todo.title, // If title is not provided, use the existing title
                description: description || todo.description, // If description is not provided, use the existing description
                completed: completed !== undefined ? completed : todo.completed, // If completed is not provided, use the existing completed value
            }
        });

        return res.status(200).json({ data: updatedTodo });
    }
    catch (error) {
        console.error('Error updating todo:', error);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
}


const deleteTodo = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTodo = await prisma.todo.delete({
            where: {
                id: id,
            }
        });

        return res.status(200).json({ message: 'Todo deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Todo not found' });
        }
        console.error('Error deleting todo:', error);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
}



module.exports = {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
};