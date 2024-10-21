const baseURL = "http://localhost:5050/api/";

// Function to register a business
export async function registerBusiness(businessName, businessEmail, password, confirmPassword, navigation) {
    console.log("Calling Backend to register business " + businessEmail);
    
    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Validate that all fields are filled
    if (!businessName || !businessEmail || !password) {
      alert('Please fill in all the fields');
      return;
    }

    // Call the backend API to register the business
    try {
      const response = await fetch(baseURL + "register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            businessName: businessName,
            businessEmail: businessEmail,
            password: password
        })
      });
  
      // Check the response status
      if (response.status === 201) {
        alert('Business registered successfully');
         navigation.navigate('Business');
      } else {
        alert('Error registering business');
      }
    } catch (err) {
      console.error('Error registering business:', err);
      alert('Error registering business');
    }

    return null;
}

// Function to fetch business details using the business email
export async function getBusinessDetails(businessEmail) {
    console.log("Calling Backend " + baseURL + "getBusinessDetails " + businessEmail);
    try {
        // Make a POST request to the getBusinessDetails endpoint with the business email
        const response = await fetch(baseURL + "getBusinessDetails", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "business_email": businessEmail
            })
        });

        // Parse the JSON response
        const data = await response.json();
        console.log("Data from API " + data.businessDetails);

        // If the business details are returned successfully, extract and return them
        if (data && data.businessDetails.business_id) {
            const businessDetailObjeect = data.businessDetails; // Extract the business details
            
            return businessDetailObjeect;    
        } else {
            // If no business details are found, alert the user
            alert('Business ID not found in response');
        }
    } catch (error) {
        // Log any errors that occur during the API call
        console.log("apiError")
    }

    return null; // Return null if the request fails

}

// Function to fetch business location details by business ID
export async function getBusinessLocation(business_id) {
    const baseURL = "http://localhost:5050/api/";

    try {
        // Make a POST request to fetch business location by business_id
        const response = await fetch(baseURL + "getBusinessLocation", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "business_id": business_id
            })
        });

        // Parse the JSON response
        const data = await response.json();

        // Check if the location details are returned successfully
        if (data && data.businessLocation) {
            return data.businessLocation;
        } else {
            throw new Error('Business location not found');
        }
    } catch (error) {
        // Log any errors during the API call
        console.error("Error fetching business location:", error);
        throw error;
    }
}

// Function to fetch business details and location by business email
export async function fetchBusinessDetailsAndLocation(business_email) {
    try {
        const businessObject = await getBusinessDetails(business_email);
        // Check if business details are found
        if (businessObject && businessObject.business_id) {
            // Fetch business location details using the business ID
            const businessLocation = await getBusinessLocation(businessObject.business_id);

            return {
                businessDetails: businessObject,
                businessLocation: businessLocation || null,  // Return null if no location found
            };
        } else {
            throw new Error('Business not found');
        }
    } catch (error) {
        console.error('Error fetching business details and location:', error);
        throw error;
    }
    
}

// Function to save business location details to the backend
export async function saveBusinessLocation(businessLocationData) {
    console.log("Calling Backend to Save Business Location", businessLocationData);
    
    try {
        // Make a POST request to the saveBusinessLocation endpoint with the business location data
        const response = await fetch(baseURL + "saveBusinessLocation", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(businessLocationData)
        });

        // Parse the JSON response
        const data = await response.json();
        console.log("Data from API: ", data);

        // If the save is successful, return the business location ID
        if (response.ok && data.businessLocationId) {
            // Return the new or updated business location ID
            return data.businessLocationId;
        } else {
            // Throw an error if saving the business location fails
            throw new Error('Failed to save business location');
        }
    } catch (error) {
        // Log any errors that occur during the API call
        console.error("Error saving business location:", error);
        throw error;
    }
}


