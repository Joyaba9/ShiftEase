// Import necessary Firebase functions
import { getDatabase, ref, push, get } from "firebase/database";

class Announcement {
    constructor() {
        this.db = getDatabase();
    }

    // Send an announcement to a specific business or general broadcast
    async sendAnnouncementToBusiness(businessId, messageTitle, messageContent, isBroadcast = false) {
        // Create an announcement object
        console.log("sendAnnouncementToBusiness called with:", { businessId, messageTitle, messageContent, isBroadcast });
        
        const announcement = {
            businessId,
            title: messageTitle,
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
    async getGeneralAnnouncements(businessId) {
        const generalRef = ref(this.db, 'announcements/general');
        console.log("getGeneralAnnouncements called with:", businessId);
    
        try {
            const snapshot = await get(generalRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log('Raw data from general announcements:', data);
    
                // Filter announcements by businessId
                const filteredData = Object.keys(data)
                    .filter(key => data[key].businessId && String(data[key].businessId) === String(businessId))
                    .sort((a, b) => b.localeCompare(a)) // Sort in reverse order
                    .reduce((result, key) => {
                        result[key] = data[key];
                        return result;
                    }, {});
    
                console.log('Filtered general announcements:', filteredData);
                return filteredData;
            } else {
                console.log('No general announcements found.');
                return {};
            }
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

    async getLatestAnnouncement(businessId) {
        const generalRef = ref(this.db, 'announcements/general');
        console.log("getLatestAnnouncement called with:", businessId);
    
        try {
            const snapshot = await get(generalRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log('Raw data from general announcements:', data);
    
                // Filter and find the latest announcement by businessId
                const latestAnnouncement = Object.keys(data)
                    .filter(key => data[key].businessId && String(data[key].businessId) === String(businessId))
                    .map(key => ({ id: key, ...data[key] }))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]; // Sort by timestamp descending
    
                console.log('Latest general announcement:', latestAnnouncement);
                return latestAnnouncement || null; // Return the latest announcement or null if none found
            } else {
                console.log('No general announcements found.');
                return null;
            }
        } catch (error) {
            console.error('Error retrieving the latest announcement:', error);
            throw error;
        }
    }
}

// Create an instance of the Announcement class
const announcementInstance = new Announcement();
export default announcementInstance;
