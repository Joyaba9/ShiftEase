// Import necessary Firebase functions
import { getDatabase, ref, push, get } from "firebase/database";

class Announcement {
    constructor() {
        this.db = getDatabase();
    }

    // Send an announcement to a specific business or general broadcast
    async sendAnnouncementToBusiness(businessId, messageContent, isBroadcast = false) {
        // Create an announcement object
        console.log("sendAnnouncementToBusiness called with:", { businessId, messageContent, isBroadcast });
        
        const announcement = {
            businessId,
            content: messageContent,
            timestamp: Date.now(),
            isBroadcast
        };

        // Determine the reference path based on whether it's a broadcast or business-specific announcement
        const announcementsRef = isBroadcast
            ? ref(this.db, `announcements/general`)
            : ref(this.db, `announcements/business/${businessId}`);

        try {
            console.log("Attempting to push announcement to Firebase at ref:", announcementsRef.toString());
            await push(announcementsRef, announcement);
            console.log('Announcement sent successfully:', announcement);
        } catch (error) {
            console.error('Error sending announcement:', error);
            throw error; // Throw error for router error handling
        }
    }

    // Retrieve general announcements (for all users)
    async getGeneralAnnouncements() {
        const generalRef = ref(this.db, 'announcements/general');

        try {
            const snapshot = await get(generalRef);
            return snapshot.exists() ? snapshot.val() : {};
        } catch (error) {
            console.error('Error retrieving general announcements:', error);
            throw error;
        }
    }

    // Retrieve announcements for a specific business
    async getAnnouncementsForBusiness(businessId) {
        
        const businessRef = ref(this.db, `announcements/business/${businessId}`);

        try {
            
            const snapshot = await get(businessRef);
            return snapshot.exists() ? snapshot.val() : {};
        } catch (error) {
            console.error('Error retrieving business announcements:', error);
            throw error;
        }
    }
}

// Create an instance of the Announcement class
const announcementInstance = new Announcement();
export default announcementInstance;

