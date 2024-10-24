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