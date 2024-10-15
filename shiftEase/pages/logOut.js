import react from 'react';
import { useState } from 'react';
import NavigationManager from './NavigationManager';




const LogOut = () => {
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    const navigation = useNavigation(); // React Navigation to navigate to Login


    const logOut = async () => {
        // Call the backend API to log out the user
        try {
            const response = await fetch('http://137.125.153.205:5050/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });


            const result = await response.json();

            if (response.ok) {
                console.log(result.message); // "Logged out successfully"
                setIsLoggedOut(true);
                // Clear any frontend session data (if applicable)
                // Navigate to login screen after successful logout
                navigation.replace('Login'); 
            } else {
                console.error('Logout failed:', result.message);
                alert('Logout failed:', result.message);
            }
        }

        catch (err) {
            console.error('Error logging out:', err);
            alert('Error logging out');
        }
    };

        React.useEffect(() => {
            logOut();
        }, []); // Empty dependency array ensures this runs once on component mount
    
        return null; // This component doesn't need to render anything
    };
    
    export default LogOut;