// Function to calculate the difference in hours between a start time and an end time
export const calculateHoursDifference = (startTime, endTime) => {
    // Match 12-hour format with optional AM/PM
    const match12Hour = /(\d{1,2}):(\d{2})\s?(AM|PM)?/i;
    // Match 24-hour format without AM/PM
    const match24Hour = /(\d{1,2}):(\d{2})(?::\d{2})?/;

    let startHour, startMinutes, endHour, endMinutes;

    const startMatch = startTime.match(match12Hour) || startTime.match(match24Hour);
    const endMatch = endTime.match(match12Hour) || endTime.match(match24Hour);

    if (!startMatch || !endMatch) {
        console.error(`Invalid time format. Start: ${startTime}, End: ${endTime}`);
        return 0;
    }

    // Parse start time
    [startHour, startMinutes] = [parseInt(startMatch[1]), parseInt(startMatch[2])];
    if (startMatch[3]) {  // If AM/PM format
        const period = startMatch[3].toUpperCase();
        if (period === 'PM' && startHour !== 12) startHour += 12;
        if (period === 'AM' && startHour === 12) startHour = 0;
    }

    // Parse end time
    [endHour, endMinutes] = [parseInt(endMatch[1]), parseInt(endMatch[2])];
    if (endMatch[3]) {  // If AM/PM format
        const period = endMatch[3].toUpperCase();
        if (period === 'PM' && endHour !== 12) endHour += 12;
        if (period === 'AM' && endHour === 12) endHour = 0;
    }

    // Create date objects
    const startDate = new Date();
    startDate.setHours(startHour, startMinutes, 0, 0);

    const endDate = new Date();
    endDate.setHours(endHour, endMinutes, 0, 0);

    // Calculate the difference
    let differenceInHours = (endDate - startDate) / (1000 * 60 * 60);

    // Handle shifts that go past midnight
    if (differenceInHours < 0) differenceInHours += 24;

    return differenceInHours;
};
  
// Function to determine the color for total hours display based on limits
export const getTotalHoursColor = (totalHours, maxHours) => {
    console.log("Total Hours: ", totalHours, "Max Hours: ", maxHours);
    if (totalHours >= maxHours) return 'red';
    else if (totalHours >= maxHours * 0.8) return '#FDDA0D';
    return 'green';
};

// Helper function to convert time to 12-hour format with AM/PM
export const formatTime = (timeStr) => {
    if (!timeStr) return "Invalid time";
    
    // Split time string into hour and minute
    const [hour, minute] = timeStr.split(':').map(Number);
    // Determine if time is AM or PM
    const period = hour >= 12 ? 'PM' : 'AM';
    // Convert hour to 12-hour format, using 12 for 0
    const formattedHour = hour % 12 || 12; 
    // Format time with leading zero for minutes
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

// Helper function to convert a 12-hour time range to 24-hour format
export const convertRangeTo24HourFormat = (timeRange) => {
    const [startTime, endTime] = timeRange.split(" - ");
    return `${convertTo24HourFormat(startTime)} - ${convertTo24HourFormat(endTime)}`;
};
  
export const convertTo24HourFormat = (time) => {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":");
  
    hours = parseInt(hours, 10);
  
    if (hours === 12) {
      hours = 0;
    }
    if (modifier === "PM") {
      hours += 12;
    }
  
    return `${String(hours).padStart(2, "0")}:${minutes}`;
};

export const formatDate = (dateString) => {
    const timestamp = Date.parse(dateString);
    if (isNaN(timestamp)) return 'Invalid Date';
    const date = new Date(timestamp);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};
