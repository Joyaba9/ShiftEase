import express from 'express';
import announcementInstance from '../Scripts/announcementScript.js';
import CurrentUser from '../CurrentUser.js';

const router = express.Router();

/*
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

*/
// Route to send an announcement to all in the business
router.post('/send', async (req, res) => {
  const { businessId, messageTitle, messageContent, isBroadcast } = req.body;

  if (!businessId || !messageTitle || !messageContent) {
    return res.status(400).json({ message: 'businessId, messageTitle and messageContent are required' });
  }

  try {
    await announcementInstance.sendAnnouncementToBusiness(businessId, messageTitle, messageContent, isBroadcast);
    res.status(200).json({ message: 'Announcement sent successfully!' });
  } catch (err) {
    console.error('Error sending announcement:', err);
    res.status(500).json({ message: 'Failed to send announcement' });
  }
});

// Route to retrieve all general announcements
router.get('/general/:businessId', async (req, res) => {
  const { businessId } = req.params;

  try {
      const announcements = await announcementInstance.getGeneralAnnouncements(businessId);
      res.status(200).json(announcements);
  } catch (err) {
      console.error('Error retrieving general announcements:', err);
      res.status(500).json({ message: 'Failed to retrieve general announcements' });
  }
});

// Route to retrieve announcements specific to a business
router.get('/business/:businessId', async (req, res) => {
  const { businessId } = req.params;

  if (!businessId) {
    return res.status(400).json({ message: 'businessId is required' });
  }

  try {
    const announcements = await announcementInstance.getAnnouncementsForBusiness(businessId);
    res.status(200).json(announcements);
  } catch (err) {
    console.error('Error retrieving business announcements:', err);
    res.status(500).json({ message: 'Failed to retrieve business announcements' });
  }
});

router.get('/general/latest/:businessId', async (req, res) => {
  const { businessId } = req.params;

  try {
      const latestAnnouncement = await announcementInstance.getLatestAnnouncement(businessId);
      if (latestAnnouncement) {
          res.status(200).json(latestAnnouncement);
      } else {
          res.status(404).json({ message: 'No announcements found for the provided business ID' });
      }
  } catch (err) {
      console.error('Error retrieving the latest general announcement:', err);
      res.status(500).json({ message: 'Failed to retrieve the latest general announcement' });
  }
});

// Export the router
export default router;
