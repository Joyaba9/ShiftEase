import express from 'express';
import notificationInstance from '../Scripts/notification.js';


const router = express.Router();

// Route to send a notification
router.post('/send', async (req, res) => {
    const { recipientId, notificationType, messageContent } = req.body;

    if (!recipientId || !notificationType) {
        return res.status(400).json({ error: 'recipientId and notificationType are required.' });
    }

    try {
        await notificationInstance.sendNotification(recipientId, notificationType, messageContent);
        res.status(200).json({ message: 'Notification sent successfully.' });
    } catch (error) {
        console.error('Error in /notifications/send:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to get notifications for a user
router.get('/:recipientId', async (req, res) => {
    const { recipientId } = req.params;

    try {
        const notifications = await notificationInstance.getNotifications(recipientId);
        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error in GET /notifications/:recipientId:', error);
        res.status(500).json({ error: 'Failed to retrieve notifications.' });
    }
});

export default router;



//13U22 password employee 

// 13 password business