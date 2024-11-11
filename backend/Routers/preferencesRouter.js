import express from 'express';
import { fetchPreferences, updatePreferences } from '../Scripts/preferencesScript.js';

const router = express.Router();

// Route to get preferences for a specific business
router.get('/get/:business_id', async (req, res) => {
    const { business_id } = req.params;
    try {
        const preferences = await fetchPreferences(business_id);
        res.status(200).json(preferences);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ message: 'Failed to fetch preferences' });
    }
});

// Route to update preferences for a specific business
router.post('/update', async (req, res) => {
    const { business_id, toggles, dropdowns } = req.body;
    try {
        await updatePreferences(business_id, toggles, dropdowns);
        res.status(200).json({ message: 'Preferences updated successfully' });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ message: 'Failed to update preferences' });
    }
});

export default router;
