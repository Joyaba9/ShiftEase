const baseURL = "http://localhost:5050/api/";

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


