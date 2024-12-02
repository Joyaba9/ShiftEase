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
