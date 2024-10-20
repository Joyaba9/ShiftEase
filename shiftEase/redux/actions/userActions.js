import { loginRequest, loginSuccess, loginFailure } from '../reducers/userReducer';
import { businessRequest, businessSuccess, businessFailure } from '../reducers/businessReducer';

// The loginUser function is an asynchronous action that handles the login process for an employee.
// It dispatches actions to update the global state depending on whether the login is successful or fails.
export const loginUser = (employeeString, password) => async (dispatch) => {
    // Dispatch loginRequest to indicate that the login process has started and set the loading state to true.
    dispatch(loginRequest());  
    try {
    // Make a POST request to the backend API to authenticate the user.
      const response = await fetch('http://localhost:5050/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeString, password }),
      });
      // Convert the API response to JSON format to access the response data.
      const data = await response.json();
      
       // Check if the API response is successful
      if (response.status === 200) {
        // Dispatch loginSuccess action to update the global state with the employee data.
        // The logged-in user's data is stored in the state, allowing it to be accessed across the app.
        dispatch(loginSuccess(data.employee));  
        console.log('Login response data:', data);
      } else {
        // If the credentials are invalid, dispatch loginFailure action to update the global state with the error message.
        dispatch(loginFailure('Invalid credentials'));  // Update global state with error
      }
    } catch (error) {
      // If there is an error during the login process (e.g., network issue), dispatch loginFailure to handle the error.
      dispatch(loginFailure('Error during login'));  // Handle login error in global state
    }
  };

  export const loginBusiness = (businessEmail, password) => async (dispatch) => {
    dispatch(businessRequest());  // Start loading state in global store
    try {
      const response = await fetch('http://localhost:5050/api/loginBusiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessEmail, password }),
      });
      const data = await response.json();
      
      if (response.status === 200) {
        dispatch(businessSuccess(data.business));  // Update global state with business data
        console.log('Login response data (Business):', data);
      } else {
        dispatch(businessFailure('Invalid business credentials'));  // Update global state with error
      }
    } catch (error) {
      dispatch(businessFailure('Error during business login'));  // Handle login error in global state
    }
};