// Import required modules
import cors from 'cors';
import express from 'express';

// Import routers
import authRouter from './Routers/authRouter.js';
import businessRouter from './Routers/businessRouter.js';
import employeeRouter from './Routers/employeeRouter.js';
import roleRouter from './Routers/roleRouter.js';
import messageRouter from './Routers/messageRouter.js';
import announcementRouter from './Routers/announcementRouter.js';
import scheduleRouter from './Routers/scheduleRouter.js';
import preferencesRouter from './Routers/preferencesRouter.js';
import imageRouter from './Routers/imageRouter.js';



const app = express();

// Middleware
app.use(cors()); // Enables CORS for all routes
app.use(express.json()); // Allows parsing JSON requests





// Routes
app.use('/api/employee', employeeRouter);
app.use('/api', authRouter);
app.use('/api', businessRouter);
app.use('/api/role', roleRouter);
app.use('/api/messages', messageRouter);
app.use ('/api/announcements', announcementRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/image', imageRouter);


// Start the server
const PORT = process.env.PORT || 5050; // Define the port to listen on, default to 5050 if not specified in environment variables
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // Log a message when the server starts
});

// Export the app for testing