// Import necessary Firebase functions
import { getDatabase, ref, push, get, child } from "firebase/database";
import CurrentUser from '../CurrentUser.js';

class Announcement {
    constructor() {
        this.db = getDatabase();
    }

    // Send an announcement to a specific user or broadcast to all users
    sendAnnouncement(toUID = "all", messageContent) {
        const fromUID = CurrentUser.getUserUID();

        // Check if there is an authenticated user
        if (!fromUID) {
            console.error("No authenticated user. Cannot send an announcement.");
            return;
        }

        // Create an announcement object
        const announcement = {
            fromUID,
            toUID,
            content: messageContent,
            timestamp: Date.now(),
            isBroadcast: toUID === "all"  // Flag to indicate if it's a broadcast announcement
        };

        // Determine the reference path based on whether it's a broadcast
        const announcementsRef = toUID === "all" 
            ? ref(this.db, `announcements/broadcast`)
            : ref(this.db, `announcements/${toUID}/personal`);

        // Push the announcement to the appropriate path
        return push(announcementsRef, announcement);
    }

    // Retrieve announcements for a specific user (including broadcasts)
    async getAnnouncementsForUser(userUID, callback) {
        const userPersonalRef = ref(this.db, `announcements/${userUID}/personal`);
        const broadcastRef = ref(this.db, `announcements/broadcast`);

        try {
            // Fetch personal and broadcast announcements
            const [personalSnapshot, broadcastSnapshot] = await Promise.all([
                get(userPersonalRef),
                get(broadcastRef)
            ]);

            // Extract the data
            const personalAnnouncements = personalSnapshot.exists() ? personalSnapshot.val() : {};
            const broadcastAnnouncements = broadcastSnapshot.exists() ? broadcastSnapshot.val() : {};

            // Pass both types of announcements to the callback
            callback(null, { personal: personalAnnouncements, broadcast: broadcastAnnouncements });
        } catch (error) {
            console.error("Error retrieving announcements:", error);
            callback(error, null);
        }
    }
}

// Create an instance of the Announcement class
const announcementInstance = new Announcement();
export default announcementInstance;


// create an instance of the Announcement class