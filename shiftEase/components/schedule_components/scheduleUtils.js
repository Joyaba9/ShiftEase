// Function to calculate the difference in hours between a start time and an end time
export const calculateHoursDifference = (startTime, endTime) => {
    // Parse start time and end time into hours and minutes
    const [startHour, startMinutes] = startTime.split(/[: ]/).map((val, index) => index === 0 ? parseInt(val) % 12 : parseInt(val));
    // Convert hour to 12-hour format (AM/PM)
    const [endHour, endMinutes] = endTime.split(/[: ]/).map((val, index) => index === 0 ? parseInt(val) % 12 : parseInt(val));
  
    // Create a new Date object for start time and set the parsed hours and minutes
    const startDate = new Date();
    startDate.setHours(startHour, startMinutes, 0);
  
    // Create a new Date object for end time and set the parsed hours and minutes
    // If end time is in PM, add 12 to convert to 24-hour format
    const endDate = new Date();
    endDate.setHours(endHour + (endTime.includes('PM') ? 12 : 0), endMinutes, 0);
  
    // Calculate the difference in hours by dividing milliseconds by (1000 * 60 * 60)
    return Math.abs((endDate - startDate) / (1000 * 60 * 60));
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
    // Split time string into hour and minute
    const [hour, minute] = timeStr.split(':').map(Number);
    // Determine if time is AM or PM
    const period = hour >= 12 ? 'PM' : 'AM';
    // Convert hour to 12-hour format, using 12 for 0
    const formattedHour = hour % 12 || 12; 
    // Format time with leading zero for minutes
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
};
