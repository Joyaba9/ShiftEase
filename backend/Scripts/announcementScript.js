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
            // Fetch general announcements
            const generalSnapshot = await get(generalRef);
            let generalAnnouncements = [];
            if (generalSnapshot.exists()) {
                const generalData = generalSnapshot.val();
                console.log('Raw data from general announcements:', generalData);
    
                // Convert and filter general announcements, then sort by timestamp
                generalAnnouncements = Object.entries(generalData)
                    .filter(([key, value]) => value.businessId && String(value.businessId) === String(businessId))
                    .map(([key, value]) => ({
                        ...value,
                        id: key,
                    }))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by timestamp in descending order
            } else {
                console.log('No general announcements found.');
            }
    
            // Fetch business announcements
            const businessRef = ref(this.db, `announcements/business/${businessId}`);
            const businessSnapshot = await get(businessRef);
            let businessAnnouncements = [];
            if (businessSnapshot.exists()) {
                const businessData = businessSnapshot.val();
                // Convert business announcements to an array and sort by timestamp
                businessAnnouncements = Object.entries(businessData)
                    .map(([key, value]) => ({
                        ...value,
                        id: key,
                    }))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by timestamp in descending order
            } else {
                console.log('No business announcements found.');
            }
    
            // Combine and sort general and business announcements
            const combinedAnnouncements = [...generalAnnouncements, ...businessAnnouncements]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
            console.log('Combined and sorted announcements:', combinedAnnouncements);
            return combinedAnnouncements;
        } catch (error) {
            console.error('Error retrieving combined announcements:', error);
            throw error;
        }
    }

    // Retrieve announcements for a specific business
    async getAnnouncementsForBusiness(businessId) {
        const businessRef = ref(this.db, `announcements/business/${businessId}`);
    
        try {
            const snapshot = await get(businessRef);
            if (snapshot.exists()) {
                const announcements = snapshot.val();
                // Convert object to an array of entries, sort in reverse order, and return it
                return Object.entries(announcements)
                    .sort((a, b) => b[0].localeCompare(a[0])) // Reverse based on keys (e.g., timestamps)
                    .map(([key, value]) => value); // Extract the values only
            }
            return [];
        } catch (error) {
            console.error('Error retrieving business announcements:', error);
            throw error;
        }
    }

    async getLatestAnnouncement(businessId) {
        const generalRef = ref(this.db, 'announcements/general');
        console.log("getLatestAnnouncement called with:", businessId);
    
        try {
            // Fetch general announcements
            const generalSnapshot = await get(generalRef);
            let generalAnnouncements = [];
            if (generalSnapshot.exists()) {
                const generalData = generalSnapshot.val();
                console.log('Raw data from general announcements:', generalData);
    
                // Convert and filter general announcements by businessId, then sort by timestamp
                generalAnnouncements = Object.keys(generalData)
                    .filter(key => generalData[key].businessId && String(generalData[key].businessId) === String(businessId))
                    .map(key => ({
                        id: key,
                        ...generalData[key],
                    }))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by timestamp descending
            } else {
                console.log('No general announcements found.');
            }
    
            // Fetch business announcements
            const businessRef = ref(this.db, `announcements/business/${businessId}`);
            const businessSnapshot = await get(businessRef);
            let businessAnnouncements = [];
            if (businessSnapshot.exists()) {
                const businessData = businessSnapshot.val();
                // Convert business announcements to an array and sort by timestamp
                businessAnnouncements = Object.keys(businessData)
                    .map(key => ({
                        id: key,
                        ...businessData[key],
                    }))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by timestamp descending
            } else {
                console.log('No business announcements found.');
            }
    
            // Combine both general and business announcements
            const combinedAnnouncements = [...generalAnnouncements, ...businessAnnouncements]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by timestamp descending
    
            // Get the latest announcement (first in the sorted array)
            const latestAnnouncement = combinedAnnouncements[0];
    
            console.log('Latest combined announcement:', latestAnnouncement);
            return latestAnnouncement || null; // Return the latest announcement or null if none found
        } catch (error) {
            console.error('Error retrieving the latest announcement:', error);
            throw error;
        }
    }
}

// Create an instance of the Announcement class
const announcementInstance = new Announcement();
export default announcementInstance;
