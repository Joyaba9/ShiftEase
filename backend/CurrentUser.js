/*
class CurrentUser {
    constructor() {
      if (!CurrentUser.instance) {
        this.userInfo = null;  // Initial user info is null
        CurrentUser.instance = this;
      }
      return CurrentUser.instance;
    }
  
    // Set user info (you can pass the Firebase Auth user data here)
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
    }
  
    // Get the current user info
    getUserInfo() {
      return this.userInfo;
    }
  }
  
  const instance = new CurrentUser();
  Object.freeze(instance);  // Freeze the instance to prevent modifications
  
  export default instance;
  
  //the following will be the code for the current adding employee file

  /*

  import express from 'express';
import { initializeFirebase } from './firebaseAdmin.js';
import currentUser from './currentUser.js'; // Import the CurrentUser singleton

const router = express.Router();
const { firestore, auth } = initializeFirebase();

// Route to add a new employee
router.post('/addEmployee', async (req, res) => {
  const { email, password, displayName, role } = req.body;

  if (!email || !password || !displayName || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Create a new employee in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });

    console.log('Employee created in Firebase Auth:', userRecord.uid);

    // Store employee data in Firestore
    const employeeData = {
      email,
      displayName,
      role,
      createdAt: new Date(),
      uid: userRecord.uid
    };

    await firestore.collection('employees').doc(userRecord.uid).set(employeeData);
    console.log('Employee data stored in Firestore');

    // Set the current user (in case you need to track user session or permissions)
    currentUser.setUserInfo({ uid: userRecord.uid, email: userRecord.email, role });

    res.status(201).json({ message: 'Employee added successfully', uid: userRecord.uid });
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Route to fetch the current user (example)
router.get('/currentUser', (req, res) => {
  const user = currentUser.getUserInfo();
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: 'No user currently set' });
  }
});

export default router;

*/