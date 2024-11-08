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
  const { businessId, messageContent, isBroadcast } = req.body;

  if (!businessId || !messageContent) {
    return res.status(400).json({ message: 'businessId and messageContent are required' });
  }

  try {
    await announcementInstance.sendAnnouncementToBusiness(businessId, messageContent, isBroadcast);
    res.status(200).json({ message: 'Announcement sent successfully!' });
  } catch (err) {
    console.error('Error sending announcement:', err);
    res.status(500).json({ message: 'Failed to send announcement' });
  }
});

// Route to retrieve all general announcements
router.get('/general', async (req, res) => {
  try {
    const announcements = await announcementInstance.getGeneralAnnouncements();
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

// Export the router
export default router;
