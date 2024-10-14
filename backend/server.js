import cors from 'cors';
import express from 'express';
import loginRouter from './loginRouter.js';
import regBusinessRouter from './regBusiness.js'; // Correct import for default export
import employeeRouter from './employeeRouter.js';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/regBusiness', regBusinessRouter); // Use the named router
app.use('/api/login', loginRouter); // Use the login router
app.use('/api/employees', employeeRouter);


// Start the server
const PORT = process.env.PORT || 5050; // Use port 5050
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
