import cors from 'cors';
import express from 'express';
import addEmpRouter from './addEmpRouter.js';
import changePasswordRouter from './changePasswordRouter.js';
import employeeRouter from './employeeRouter.js';
import getBusinessById from './getBusinessIDRouter.js';
import loginRouter from './loginRouter.js';
import regBusinessRouter from './regBusiness.js'; // Correct import for default export
import logoutRouter from './logout.js';
import businessRouter from './BusinessDetailsRouter.js';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/regBusiness', regBusinessRouter); // Use the named router
app.use('/api/login', loginRouter); // Use the login router
app.use('/api/employees', employeeRouter);
app.use('/api/change-password', changePasswordRouter);

app.use('/api/getBusinessId', getBusinessById);
app.use('/api', businessRouter);

app.use('/api/addEmp', addEmpRouter); // Use the addEmp router
app.use('/api/logout', logoutRouter);

// Start the server
const PORT = process.env.PORT || 5050; // Use port 5050
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
