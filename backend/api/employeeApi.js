const baseURL = "http://localhost:5050/api/";

export const fetchEmployees = async (businessId) => {
    try {
        const response = await fetch(baseURL + `employee/fetchAll/${businessId}`);

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Failed to fetch employees');
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
};

export const fetchEmployeesWithRoles = async (businessId) => {
  try {
      const response = await fetch(baseURL + `employee/fetchAll/${businessId}`);
      if (response.ok) {
          const data = await response.json();
          return data;
      }
      throw new Error('Failed to fetch employees with roles');
  } catch (error) {
      console.error('Error fetching employees with roles:', error);
      throw error;
  }
};

// Fetch all employee availability for a specific business
export const fetchAllEmployeeAvailability = async (businessId) => {
    try {
        const response = await fetch(baseURL + `schedule/allEmployeeAvailability/${businessId}`);

        if (response.ok) {
            const data = await response.json();
            console.log("All employee availability fetched:", data);
            return data;
        } else {
            throw new Error('Failed to fetch all employee availability');
        }
    } catch (error) {
        console.error('Error fetching all employee availability:', error);
        throw error;
    }
};

// Fetch all availability for a specific employee
export const fetchEmployeeAvailability = async (empId) => {
    try {
        const response = await fetch(baseURL + `schedule/employeeAvailability/${empId}`);

        if (response.ok) {
            const data = await response.json();
            console.log("Employee availability fetched:", data);
            return data;
        } else {
            throw new Error('Failed to fetch employee availability');
        }
    } catch (error) {
        console.error('Error fetching employee availability:', error);
        throw error;
    }
};

// Fetch availability for all employees
export const fetchAvailableEmployees = async (businessId, day, date) => {
    try {
        const response = await fetch(baseURL + `schedule/availableEmployees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                businessId,
                day,
                date,
            }),
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Available employees fetched:', data);
            return data;
        } else {
            throw new Error('Failed to fetch available employees');
        }
    } catch (error) {
        console.error('Error fetching available employees:', error);
        throw error;
    }
};

export const uploadEmployeePhoto = async (empId, localFilePath, originalName) => {
    console.log("Employee id in upload employee photo: ", empId);
    console.log("Local file path: ", localFilePath);
    console.log("original name: ", originalName);
    try {
        const formData = new FormData();
        formData.append('emp_id', empId); // Add employee ID as text field

        // Convert `blob:` URL to `File`
        const response = await fetch(localFilePath);
        const blob = await response.blob();
        const file = new File([blob], originalName, { type: blob.type });

        formData.append('photo', file);

        // Log form data for debugging
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        const res = await fetch(baseURL + 'image/uploadEmployeePhoto', {
            method: 'POST',
            body: formData, // Browser will set `Content-Type`
        });

        if (res.ok) {
            const data = await res.json();
            console.log('Profile photo uploaded:', data);
            return data; // Contains updated employee object
        } else {
            const errorText = await res.text(); // Get backend error message
            console.error('Error Response:', errorText);
            throw new Error('Failed to upload profile photo');
        }
    } catch (error) {
        console.error('Error in uploadEmployeePhoto:', error);
        throw error;
    }
}

export const getEmployeePhoto = async (empId) => {
    try {
        const response = await fetch(baseURL + `image/getEmployeePhoto?emp_id=${empId}`, {
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
        console.error('Error in getEmployeePhoto:', error);
        throw error;
    }
};
