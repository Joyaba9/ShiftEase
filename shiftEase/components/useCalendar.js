import { format } from 'date-fns';

export const getDateRangeText = (view, currentDate) => {
    if (view === 'week') {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return `${format(startOfWeek, 'MMM d')} - ${format(endOfWeek, 'MMM d, yyyy')}`;
    } else {
        return format(currentDate, 'MMM d, yyyy');
    }
};

export const changeDate = (view, currentDate, direction) => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (view === 'day') {
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    return newDate;
};

export const getWeekDates = (currentDate) => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        dates.push(day);
    }
    return dates;
};

export const getDayView = (currentDate) => {
    return [currentDate];
};