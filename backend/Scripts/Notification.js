import { getDatabase, ref, push, get } from 'firebase/database';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Notification {
    constructor() {
        this.db = getDatabase();

        // Load notification types from JSON file
        const jsonPath = path.resolve(__dirname, 'notificationTypes.json');
        const data = fs.readFileSync(jsonPath);
        this.notificationTypes = JSON.parse(data);
    }

    // Send a notification to a specific user
    async sendNotification(recipientId, notificationType, messageContent) {
        // Get predefined message for the notification type
        const predefinedMessage = this.notificationTypes[notificationType];

        if (!predefinedMessage) {
            throw new Error(`Notification type '${notificationType}' not found.`);
        }

        // Construct the notification message
        const notificationMessage = `${predefinedMessage} ${messageContent || ''}`.trim();

        const notification = {
            recipientId,
            content: notificationMessage,
            notificationType,
            timestamp: Date.now(),
        };

        // Reference to the user's notifications in Firebase
        const notificationsRef = ref(this.db, `notifications/${recipientId}`);

        try {
            await push(notificationsRef, notification);
            console.log('Notification sent successfully:', notification);
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    // Retrieve notifications for a specific user
    async getNotifications(recipientId) {
        const notificationsRef = ref(this.db, `notifications/${recipientId}`);

        try {
            const snapshot = await get(notificationsRef);
            return snapshot.exists() ? snapshot.val() : {};
        } catch (error) {
            console.error('Error retrieving notifications:', error);
            throw error;
        }
    }
}

// Create an instance of the Notification class
const notificationInstance = new Notification();
export default notificationInstance;
