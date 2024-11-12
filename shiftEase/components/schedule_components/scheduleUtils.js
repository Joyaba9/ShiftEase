// Function to calculate the difference in hours between a start time and an end time
export const calculateHoursDifference = (startTime, endTime) => {
    const startMatch = startTime.match(/(\d+):(\d+)\s?(AM|PM)/i);
    const endMatch = endTime.match(/(\d+):(\d+)\s?(AM|PM)/i);

    if (!startMatch || !endMatch) {
        console.error(`Invalid time format. Start: ${startTime}, End: ${endTime}`);
        return 0; // or handle this error as needed
    }

    let [startHour, startMinutes, startPeriod] = startMatch.slice(1);
    startHour = parseInt(startHour);
    startMinutes = parseInt(startMinutes);

    if (startPeriod.toUpperCase() === 'PM' && startHour !== 12) {
        startHour += 12;
    } else if (startPeriod.toUpperCase() === 'AM' && startHour === 12) {
        startHour = 0;
    }

    let [endHour, endMinutes, endPeriod] = endMatch.slice(1);
    endHour = parseInt(endHour);
    endMinutes = parseInt(endMinutes);

    if (endPeriod.toUpperCase() === 'PM' && endHour !== 12) {
        endHour += 12;
    } else if (endPeriod.toUpperCase() === 'AM' && endHour === 12) {
        endHour = 0;
    }

    const startDate = new Date();
    startDate.setHours(startHour, startMinutes, 0, 0);

    const endDate = new Date();
    endDate.setHours(endHour, endMinutes, 0, 0);

    const differenceInHours = (endDate - startDate) / (1000 * 60 * 60);
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
