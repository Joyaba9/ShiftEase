const baseURL = "http://localhost:5050/api/";

// Function to call the backend API to create a weekly schedule
export async function createWeeklyScheduleAPI(businessId, weekStartDate) {
    try {
        const response = await fetch(baseURL + `schedule/createWeeklySchedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                businessId,
                weekStartDate,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.schedule;
        } else {
            throw new Error('Failed to create weekly schedule');
        }
    } catch (error) {
        console.error('Error creating weekly schedule:', error);
        throw error;
    }
}

// Function to call the backend API to create a shift
export async function createShiftAPI(employeeId, scheduleId, date, startTime, endTime, rowIndex) {
    console.log("Calling createShiftAPI with:", { employeeId, scheduleId, date, startTime, endTime, rowIndex });  
    try {
        const response = await fetch(baseURL + `schedule/createShift`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                employeeId,
                scheduleId,
                date,
                startTime,
                endTime,
                rowIndex,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Shift created:", data);
            return data.shift;
        } else {
            throw new Error('Failed to create shift');
        }
    } catch (error) {
        console.error('Error creating shift:', error);
        throw error;
    }
}

export async function fetchScheduleAPI(businessId, weekStartDate) {
    try {
        const response = await fetch(baseURL + `schedule/getScheduleId?businessId=${businessId}&weekStartDate=${weekStartDate}`, {
            method: 'GET',
        });

        if (response.status === 404) {
            console.warn("No schedule found for the given week.");
            return null;  // Return null if schedule does not exist
        }

        if (response.ok) {
            const data = await response.json();
            return data;  // Contains the schedule and shifts
        } else {
            throw new Error('Failed to fetch schedule');
        }
    } catch (error) {
        console.error('Error in fetchScheduleAPI:', error);
        throw error;
    }
}

// Function to call the backend API to update a shift
export async function updateShiftAPI(shiftId, startTime, endTime, description) {
    try {
        const response = await fetch(baseURL + `schedule/updateShift/${shiftId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startTime,
                endTime,
                description,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Shift updated:", data);
            return data;
        } else {
            const errorData = await response.json();
            console.error("Failed to update shift:", errorData);
            throw new Error(errorData.message || 'Failed to update shift');
        }
    } catch (error) {
        console.error('Error updating shift:', error);
        throw error;
    }
}

// Function to call the backend API to remove a shift
export async function removeShiftAPI(shiftId) {
    try {
        const response = await fetch(baseURL + `schedule/removeShift/${shiftId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Shift removed successfully:", data);
            return data;
        } else {
            const errorData = await response.json();
            console.error("Failed to remove shift:", errorData);
            throw new Error(errorData.message || 'Failed to remove shift');
        }
    } catch (error) {
        console.error('Error removing shift:', error);
        throw error;
    }
}

// Function to call the backend API to create a shift offer
export async function offerShiftAPI(shiftId, empId) {
    console.log('offerShiftAPI called with:', { shiftId, empId });
    try {
        const response = await fetch(baseURL + `schedule/createShiftOffer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                shift_id: shiftId,
                emp_id: empId,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Shift offer created successfully:', data);
            return data;
        } else {
            const errorData = await response.json();
            console.error('Failed to create shift offer:', errorData);
            throw new Error(errorData.message || 'Failed to create shift offer');
        }
    } catch (error) {
        console.error('Error in offerShiftAPI:', error);
        throw error;
    }
}

export async function fetchEmployeeShiftOffersAPI(empId) {
    try {
        const response = await fetch(baseURL + `schedule/employeeShiftOffers?emp_id=${empId}`, {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            return data.offers;
        } else {
            const errorData = await response.json();
            console.error('Failed to fetch offered shifts:', errorData);
            throw new Error(errorData.message || 'Failed to fetch offered shifts');
        }
    } catch (error) {
        console.error('Error in fetchOfferedShiftsAPI:', error);
        throw error;
    }
}

export async function cancelShiftOfferAPI(shiftId, empId) {
    console.log('cancelShiftOfferAPI called with:', { shiftId, empId });
    try {
        const response = await fetch(baseURL + `schedule/cancelShiftOffer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                shift_id: shiftId,
                emp_id: empId,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Shift offer cancelled successfully:', data);
            return data;
        } else {
            const errorData = await response.json();
            console.error('Failed to cancel shift offer:', errorData);
            throw new Error(errorData.message || 'Failed to cancel shift offer');
        }
    } catch (error) {
        console.error('Error in cancelShiftOfferAPI:', error);
        throw error;
    }
}

export async function fetchOpenShiftOffers(empId, businessId) {
    try {
        const response = await fetch(baseURL + `schedule/searchOpenShiftOffers?emp_id=${empId}&business_id=${businessId}`, 
            {
                method: 'GET',
            }
        );

        if (response.ok) {
            const data = await response.json();
            return data.offers; // Extracting the 'offers' array from the response
        } else {
            const errorData = await response.json();
            console.error("Failed to fetch open shift offers:", errorData);
            throw new Error(errorData.message || 'Failed to fetch open shift offers');
        }
    } catch (error) {
        console.error("Error in fetchOpenShiftOffers:", error);
        throw error;
    }
}