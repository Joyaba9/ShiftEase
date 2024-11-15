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