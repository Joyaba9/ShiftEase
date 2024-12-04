import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { addEmployeePhoto, getEmployeePhoto, addBusinessPhoto, getBusinessPhoto } from '../scripts/imageScript.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Extract original extension
        const fileName = `${Date.now()}-${file.fieldname}${ext}`;
        cb(null, fileName);
    },
});
const upload = multer({ storage });

// Route to upload an employee's profile photo
router.post('/uploadEmployeePhoto', upload.single('photo'), async (req, res) => {
    console.log('Request received at /uploadEmployeePhoto');
    const { emp_id } = req.body;
    const file = req.file;

    if (!emp_id || !file) {
        console.error('Validation failed: emp_id or photo missing.');
        return res.status(400).json({ error: 'emp_id and photo are required.' });
    }

    try {
        const filePath = path.resolve(file.path);
        console.log(`Resolved file path: ${filePath}`);

        // Pass emp_id, filePath, and original file name to the script
        const updatedEmployee = await addEmployeePhoto(emp_id, filePath, file.originalname);

        console.log(`Profile photo updated successfully for emp_id: ${emp_id}`);
        res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully.',
            employee: updatedEmployee,
        });
    } catch (error) {
        console.error('Error in /uploadEmployeePhoto:', error);
        res.status(500).json({ error: error.message || 'Failed to update profile photo.' });
    } finally {
        if (file?.path) {
            console.log(`Deleting temporary file: ${file.path}`);
            await fs.unlink(file.path).catch((err) =>
                console.error('Error deleting temp file:', err)
            );
        }
    }
});

// Route to upload an Businesses profile photo
router.post('/uploadBusinessPhoto', upload.single('photo'), async (req, res) => {
    const { business_id } = req.body;
    const file = req.file;

    if (!business_id || !file) {
        console.error('Validation failed: business_id or photo missing.');
        return res.status(400).json({ error: 'business_id and photo are required.' });
    }

    try {
        const filePath = path.resolve(file.path);
        console.log(`Resolved file path: ${filePath}`);

        // Pass business_id, filePath, and original file name to the script
        const updatedBusiness = await addBusinessPhoto(business_id, filePath, file.originalname);

        console.log(`Profile photo updated successfully for business_id: ${business_id}`);
        res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully.',
            business: updatedBusiness,
        });
    } catch (error) {
        console.error('Error in /uploadBusinessPhoto:', error);
        res.status(500).json({ error: error.message || 'Failed to update profile photo.' });
    } finally {
        if (file?.path) {
            console.log(`Deleting temporary file: ${file.path}`);
            await fs.unlink(file.path).catch((err) =>
                console.error('Error deleting temp file:', err)
            );
        }
    }
});

// Route to retrieve an employee's profile photo
router.get('/getEmployeePhoto', async (req, res) => {
    console.log('Request received at /getEmployeePhoto');
    const { emp_id } = req.query;

    if (!emp_id) {
        console.error('Validation failed: emp_id missing.');
        return res.status(400).json({ error: 'emp_id is required.' });
    }

    try {
        const profilePhotoUrl = await getEmployeePhoto(emp_id);
        res.status(200).json({
            success: true,
            emp_id,
            profilePhotoUrl,
        });
    } catch (error) {
        console.error('Error in /getEmployeePhoto:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve profile photo.' });
    }
});

// Route to retrieve an businesses profile photo
router.get('/getBusinessPhoto', async (req, res) => {
    console.log('Request received at /getBusinessPhoto');
    const { business_id } = req.query;

    if (!business_id) {
        console.error('Validation failed: business_id missing.');
        return res.status(400).json({ error: 'business_id is required.' });
    }

    try {
        const profilePhotoUrl = await getBusinessPhoto(business_id);
        res.status(200).json({
            success: true,
            business_id,
            profilePhotoUrl,
        });
    } catch (error) {
        console.error('Error in /getBusinessPhoto:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve profile photo.' });
    }
});

export default router;
