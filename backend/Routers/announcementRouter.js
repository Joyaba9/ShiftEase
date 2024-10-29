import express from 'express';
import announcementInstance from '../Scripts/announcementScript.js';
import CurrentUser from '../CurrentUser.js';

const router = express.Router();

// Middleware to check if a user is authenticated via CurrentUser
const authenticate = (req, res, next) => {
  const user = CurrentUser.getUserInfo();
  console.log('Authenticated user:', user); // Log user info
  if (user && user.uid) { // Check if user is authenticated
    req.user = user; // Store user info in the request object
    next();
  } else {
    console.log('Unauthorized access attempt');
    res.status(401).send('Unauthorized');
  }
};

// Route to send an announcement
router.post('/send', authenticate, (req, res) => {
  const { toUID, messageContent, isBroadcast } = req.body;

  // Get the UID of the authenticated user
  try {
    announcementInstance.sendAnnouncement(toUID, messageContent, isBroadcast); // Send the announcement
    res.status(200).json({ message: 'Announcement sent successfully!' });
  } catch (err) {
    console.error('Error sending announcement:', err);
    res.status(500).json({ message: 'Failed to send announcement' });
  }
});

// Route to retrieve announcements for the authenticated user
router.get('/retrieve', authenticate, (req, res) => {
  const userUID = req.user.uid;

  // Get announcements for the authenticated user
  announcementInstance.getAnnouncementsForUser(userUID, (error, data) => {
    if (error) {
      console.error('Error retrieving announcements:', error);
      res.status(500).json({ message: 'Failed to retrieve announcements' }); // Send error response
    } else {
      res.status(200).json(data);
    }
  });
});

// Export the router
export default router;
