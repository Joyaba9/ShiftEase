// Import required modules
import cors from 'cors';
import express from 'express';

// Import routers
import authRouter from './Routers/authRouter.js';
import businessRouter from './Routers/businessRouter.js';
import employeeRouter from './Routers/employeeRouter.js';
import roleRouter from './Routers/roleRouter.js';
import messageRouter from './Routers/messageRouter.js';


const app = express();

// Middleware
app.use(cors()); // Enables CORS for all routes
app.use(express.json()); // Allows parsing JSON requests

// Routes
app.use('/api/employee', employeeRouter);
app.use('/api', authRouter);
app.use('/api', businessRouter);
app.use('/api/role', roleRouter);
app.use('/api/message', messageRouter);



// Start the server
const PORT = process.env.PORT || 5050; // Define the port to listen on, default to 5050 if not specified in environment variables
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // Log a message when the server starts
});


//can you write a test to test writing a message, retrieving a message and retreiving sent messages on curl, the uid is "vETosJMqkpgyYxnqJs1qUdEMIY32" and  "E3vJZVs2oRctC1l4n3yJrSqnubE3". Additionally 