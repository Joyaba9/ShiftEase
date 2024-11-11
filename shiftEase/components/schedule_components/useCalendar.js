import { format } from 'date-fns';

// Function to generate a formatted date range text based on the view (week or day)
export const getDateRangeText = (view, currentDate) => {
    if (view === 'week') {
        // Calculate the start of the week (Sunday) by setting the day of the current date to the start of the week
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        // Calculate the end of the week by adding 6 days to the start of the week
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // Format the start and end of the week to display as "Month Day - Month Day, Year"
        return `${format(startOfWeek, 'MMM d')} - ${format(endOfWeek, 'MMM d, yyyy')}`;
    } else {
        // If the view is not 'week' (assumed to be 'day'), format the current date as "Month Day, Year"
        return format(currentDate, 'MMM d, yyyy');
    }
};

// Function to change the current date based on view and direction
export const changeDate = (view, currentDate, direction) => {
    // Create a new date object to modify without affecting the original date
    const newDate = new Date(currentDate);
    if (view === 'week') {
        // If the view is 'week', move the date by 7 days forward or backward based on direction
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (view === 'day') {
        // If the view is 'day', move the date by 1 day forward or backward based on direction
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    return newDate;
};

export const getWeekDates = (currentDate) => {
    console.log('Getting week dates');
    const startOfWeek = getStartOfWeek(currentDate); // Use the verified function here
    console.log('Start of the week in getWeekDates:', startOfWeek);

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i); // Increment day by day
        dates.push(day);
        console.log(`Date for day ${i}:`, day);
    }
    return dates;
};

// Function to return the current date as a single-element array, used for 'day' view
export const getDayView = (currentDate) => {
    // Return an array with only the current date for the 'day' view
    return [currentDate];
};

export const getStartOfWeek = (currentDate) => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay(); // 0 (Sunday) to 6 (Saturday)
    startOfWeek.setDate(currentDate.getDate() - day);
    // Set the time to midnight for consistency
    startOfWeek.setHours(0, 0, 0, 0);

    
    return startOfWeek;
};