import express from 'express'; 
import cors from 'cors';
import regBusinessRouter from './regBusiness.js'; // Correct import for default export


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/regBusiness', regBusinessRouter); // Use the named router

// Start the server
const PORT = process.env.PORT || 5050; // Use port 5050
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
