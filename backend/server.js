import cors from 'cors';
import express from 'express';
import authRouter from './AuthRouter.js';
import businessRouter from './BusinessDetailsRouter.js';
import employeeRouter from './employeeRouter.js';
import getBusinessById from './getBusinessIDRouter.js';
import regBusinessRouter from './regBusiness.js'; // Correct import for default export


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/employee', employeeRouter);
app.use('/api/auth', authRouter);

app.use('/api/regBusiness', regBusinessRouter); // Use the named route
app.use('/api/getBusinessId', getBusinessById);
app.use('/api', businessRouter);

// Start the server
const PORT = process.env.PORT || 5050; // Use port 5050
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
