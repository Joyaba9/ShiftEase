import cors from 'cors';
import express from 'express';
import authRouter from './authRouter.js';
import businessRouter from './businessRouter.js';
import employeeRouter from './employeeRouter.js';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/employee', employeeRouter);
app.use('/api/auth', authRouter);
app.use('/api/business', businessRouter);

// Start the server
const PORT = process.env.PORT || 5050; // Use port 5050
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
