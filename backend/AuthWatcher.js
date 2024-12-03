import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../shiftEase/redux/reducers/userReducer";
import { businessSuccess, logoutBusiness } from "../shiftEase/redux/reducers/businessReducer";

export const AuthWatcher = () => {
    const dispatch = useDispatch();
    const auth = getAuth();
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log('User authenticated:', user);
  
          try {
            // Fetch user type (business or employee) from your backend
            const response = await fetch(`http://localhost:5050/api/getUserType?uid=${user.uid}`);
            const data = await response.json();
  
            console.log("AuthWatcher: Firebase data: ", data);
            if (response.ok) {
              const { isBusiness, user: userData } = data;
              if (isBusiness) {
                // Update Redux for business user
                dispatch(businessSuccess({ firebaseUser: user, ...userData }));
              } else {
                // Update Redux for employee user
                dispatch(loginSuccess({ firebaseUser: user, ...userData }));
              }
            } else {
              console.error('Error determining user type:', data.error);
            }
          } catch (error) {
            console.error('Error fetching user type:', error);
          }
        } else {
          console.log('User logged out');
          dispatch(logout());
          dispatch(logoutBusiness());
        }
      });
  
      return () => unsubscribe();
    }, [dispatch]);
  
    return null; // This component handles logic only
};