import react from 'react';
import { useState } from 'react';
import NavigationManager from './NavigationManager';




const LogOut = () => {
    const [isLoggedOut, setIsLoggedOut] = useState(false);

    const logOut = async () => {
        // Call the backend API to log out the user
        try {
            const response = await fetch('http://localhost:5050/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });



            // log out should clear all account data and return to the lopgin screen


            //log out 
        }   

        catch (err) {
            console.error('Error logging out:', err);
            alert('Error logging out');
        }

    }
}