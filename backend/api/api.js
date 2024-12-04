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
        // If registration is successful, make a second request to fetch the business ID
        try{
            const response = await fetch(baseURL + "getBusinessIDFromEmail", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                business_email: businessEmail,
              })
            });
          
            // Parse the response to extract the business_id
            const data = await response.json();
  
            // If the business_id is returned successfully, store it in state
            if (data && data.business_id) {
                // Return the business_id to the registration page
                return data.business_id; 
            } else {
              alert('Business ID not found in response');
            }
          } catch (err) {
            console.error('Error receiving business_id:', err);
            alert('Error receiving business_id');
          }
      } else {
        alert('Error registering business');
      }
    } catch (err) {
      console.error('Error registering business:', err);
      alert('Error registering business');
    }

    return null;
}

export const uploadBusinessPhoto = async (businessId, localFilePath, originalName) => {
    console.log("Business id in upload business photo: ", businessId);
    console.log("Local file path: ", localFilePath);
    console.log("original name: ", originalName);
    try {
        const formData = new FormData();
        formData.append('business_id', businessId); // Add employee ID as text field

        // Convert `blob:` URL to `File`
        const response = await fetch(localFilePath);
        const blob = await response.blob();
        const file = new File([blob], originalName, { type: blob.type });

        formData.append('photo', file);

        // Log form data for debugging
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        const res = await fetch(baseURL + 'image/uploadBusinessPhoto', {
            method: 'POST',
            body: formData,
        });

        if (res.ok) {
            const data = await res.json();
            console.log('Profile photo uploaded:', data);
            return data; // Contains updated business object
        } else {
            const errorText = await res.text(); // Get backend error message
            console.error('Error Response:', errorText);
            throw new Error('Failed to upload profile photo');
        }
    } catch (error) {
        console.error('Error in uploadBusinessPhoto:', error);
        throw error;
    }
}

export const getBusinessPhoto = async (businessId) => {
    try {
        const response = await fetch(baseURL + `image/getBusinessPhoto?business_id=${businessId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Profile photo fetched:', data);
            return data.profilePhotoUrl; // Returns the profile photo URL
        } else {
            throw new Error('Failed to fetch profile photo');
        }
    } catch (error) {
        console.error('Error in getBusinessPhoto:', error);
        throw error;
    }
};

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
            let businessLocation = null;

            // Fetch business location details using the business ID
            try {
                businessLocation = await getBusinessLocation(businessObject.business_id);
            } catch (error) {
                console.warn('Business location not found or not set:', error);  // Warn if location isn't found
            }
            
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


