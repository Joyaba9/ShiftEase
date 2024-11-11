// Function to calculate the difference in hours between a start time and an end time
export const calculateHoursDifference = (startTime, endTime) => {
    let [startHour, startMinutes, startPeriod] = startTime.match(/(\d+):(\d+)\s?(AM|PM)/i).slice(1);
    startHour = parseInt(startHour);
    startMinutes = parseInt(startMinutes);

    // Convert start time to 24-hour format
    if (startPeriod.toUpperCase() === 'PM' && startHour !== 12) {
        startHour += 12;
    } else if (startPeriod.toUpperCase() === 'AM' && startHour === 12) {
        startHour = 0;
    }

    // Parse end time
    let [endHour, endMinutes, endPeriod] = endTime.match(/(\d+):(\d+)\s?(AM|PM)/i).slice(1);
    endHour = parseInt(endHour);
    endMinutes = parseInt(endMinutes);

    // Convert end time to 24-hour format
    if (endPeriod.toUpperCase() === 'PM' && endHour !== 12) {
        endHour += 12;
    } else if (endPeriod.toUpperCase() === 'AM' && endHour === 12) {
        endHour = 0;
    }

    // Create Date objects for start and end times on the same day
    const startDate = new Date();
    startDate.setHours(startHour, startMinutes, 0, 0);

    const endDate = new Date();
    endDate.setHours(endHour, endMinutes, 0, 0);

    // Calculate the difference in hours
    const differenceInHours = (endDate - startDate) / (1000 * 60 * 60);

    // If the difference is negative, add 24 hours to handle cases crossing midnight
    return differenceInHours >= 0 ? differenceInHours : differenceInHours + 24;
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
