import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { getWeekDates, getDayView, getStartOfWeek } from '../../components/schedule_components/useCalendar';
import NavBar from '../../components/NavBar';
import HeaderControls from '../../components/schedule_components/HeaderControls';
import { fetchScheduleAPI } from '../../../backend/api/scheduleApi';
import { formatTime } from '../../components/schedule_components/scheduleUtils';
import useEmployeeData from '../../components/schedule_components/useEmployeeData';

const ViewSchedulePage = () => {
    // Retrieve the logged-in user from Redux store
    const loggedInUser = useSelector((state) => state.user.loggedInUser);
    const businessId = loggedInUser?.employee?.business_id;
    const loggedInEmployeeId = loggedInUser?.employee?.emp_id;
    console.log('Logged in user:', loggedInUser);
    console.log('Business ID: ', businessId);
    console.log('Logged in employee id: ', loggedInEmployeeId);

    // State for managing schedule and view mode
    const [scheduleId, setScheduleId] = useState(null);
    const [scheduledEmployees, setScheduledEmployees] = useState([]);
    const [scheduleLoaded, setScheduleLoaded] = useState(false);

    // State for calendar view (week or day)s
    const [view, setView] = useState('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);

    const dates = useMemo(() => {
        return view === 'week' ? getWeekDates(currentDate) : getDayView(currentDate);
    }, [view, currentDate]);

    // Get employees and shifts using useEmployeeData hook
    const { employees, setEmployees, setEmployeeAssignments, shiftAssignments, setShiftAssignments } = useEmployeeData(businessId);
    console.log('Data from useEmployeeData: ');
    console.log('Employees: ', employees);
    console.log('Shift Assignments: ', shiftAssignments);

    // Track if employees have been loaded
    const employeesLoadedRef = useRef(false);

    // Fetch and load schedule and shifts for the selected week
    useEffect(() => {
        const loadSchedule = async () => {
            // Check if employees are loaded before running the function
            if (!employees || employees.length === 0 || employeesLoadedRef.current) {
                console.log("Employees not yet loaded, skipping schedule load.");
                return;
            }

            setIsLoading(true);
            employeesLoadedRef.current = true;

            const weekStartDate = getStartOfWeek(currentDate);
            console.log("Business ID:", businessId, "Week Start Date:", weekStartDate);

            try {
                console.log("Trying to loadSchedule");

                const existingSchedule = await fetchScheduleAPI(businessId, weekStartDate);
                console.log('Schedule: ', existingSchedule);

                if (existingSchedule && existingSchedule.schedule) {
                    setScheduleId(existingSchedule.schedule.schedule_id);

                    // Filter employees who have shifts in the schedule
                    const scheduledEmployeeIds = new Set(existingSchedule.shifts.map(shift => shift.employeeId));
                    const filteredScheduledEmployees = employees.filter(employee => scheduledEmployeeIds.has(employee.emp_id));
                    setScheduledEmployees(filteredScheduledEmployees);

                    // Set assignments to display in grid
                    const loadedEmployeeAssignments = {};
                    const loadedShiftAssignments = {};

                    existingSchedule.shifts.forEach(shift => {
                        // Format both dates to YYYY-MM-DD 
                        const shiftDate = shift.date.slice(0, 10); // Extract YYYY-MM-DD
                        const dateIndex = dates.findIndex(date => date.toISOString().slice(0, 10) === shiftDate);

                        if (dateIndex !== -1) {
                            const cellId = `${shift.employeeId}-${dateIndex}`;
                            loadedEmployeeAssignments[cellId] = {
                                f_name: shift.employeeName.split(' ')[0],
                                l_name: shift.employeeName.split(' ')[1]
                            };
                            loadedShiftAssignments[cellId] = `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`;
                        }
                    });

                    setEmployeeAssignments(loadedEmployeeAssignments);
                    setShiftAssignments(loadedShiftAssignments);

                    console.log('Employee Assignments: ', loadedEmployeeAssignments);
                    console.log('Shift Assignments: ', loadedShiftAssignments);
                    
                    setScheduleLoaded(true);
                }
            } catch (error) {
                console.error("Error loading schedule:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadSchedule();
    }, [businessId, currentDate, dates, employees, setEmployeeAssignments, setShiftAssignments, ]);
    
    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false} 
            showsHorizontalScrollIndicator={false}
        >
            <View style={styles.container}>
                <NavBar homeRoute={'Employee'}/>

                <Text style={styles.dashboardText}> View Schedule</Text>

                <View style={styles.dashboardContainer}>
                    <View style={styles.wholeScheduleContainer}>
                        {/* Header controls for view mode and date selection */}
                        <HeaderControls 
                            view={view} 
                            currentDate={currentDate} 
                            setView={setView} 
                            setCurrentDate={setCurrentDate} 
                        />
                        {scheduleLoaded && !isLoading && (
                            <View style={styles.scheduleContainer}> 
                                <View style={styles.gridHeader}>
                                    {/* Header row for dates */}
                                    <View style={styles.employeeCell}><Text>Employee</Text></View>
                                    {dates.map((date, index) => (
                                        <View key={index} style={styles.headerCell}>
                                            <Text>{date.toDateString()}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Rows for each employee */}
                                {scheduledEmployees.map((employee) => (
                                    <View 
                                        key={employee.emp_id} 
                                        style={[
                                            styles.gridRow, 
                                            employee.emp_id === loggedInEmployeeId && styles.highlightRow
                                        ]}>
                                        {/* Employee name cell */}
                                        <View style={styles.employeeCell}>
                                            <Text>{employee.f_name} {employee.l_name}</Text>
                                        </View>
                                        
                                        {/* Schedule cells for each day */}
                                        {dates.map((date, colIndex) => {
                                            const cellId = `${employee.emp_id}-${colIndex}`;
                                            const shiftTime = shiftAssignments[cellId];

                                            return (
                                                <View key={colIndex} style={styles.scheduleCell}>
                                                    <Text>
                                                        {shiftTime ? shiftTime : 'Off'}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        )}   
                    </View>
                </View>
            </View>

        </ScrollView>
    );

};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        minHeight: '100%',
        height: 200,
        minWidth: 950,
        userSelect: 'none',
        backgroundColor: 'white'
    },
    dashboardText: {
        fontSize: 30,
        alignSelf: 'flex-start',
        marginVertical: 40,
        marginLeft: 30
    },
    dashboardContainer: {
        flexGrow: 1,
        width: '100%',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    wholeScheduleContainer: {
        width: '95%',
        minWidth: '60%',
        minHeight: '60%',
    },
    scheduleContainer: {
        flexDirection: 'column',
        width: '100%',
        minHeight: '50%',
        alignSelf: 'center',
        minHeight: '45%',
        //borderWidth: 2,
        //borderColor: 'red'
    },
    gridHeader: {
        width: '100%',
        height: 50,
        //alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 5,
    },
    headerCell: {
        flex: 1,
        alignItems: 'center',
        padding: 8,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        backgroundColor: '#e7e7e7',
        borderColor: '#ccc',
    },
    employeeCell: {
        width: 140,
        padding: 8,
        alignItems: 'center',
        borderRightWidth: 1,
        borderLeftWidth: 1,
        //borderBottomWidth: 1,
        //backgroundColor: '#e7e7e7',
        borderColor: '#ccc',
    },
    gridRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    scheduleCell: {
        flex: 1,
        alignItems: 'center',
        padding: 8,
        borderRightWidth: 1,
        borderColor: '#ccc',
    },
    highlightRow: { 
        backgroundColor: '#e0f7fa' 
    }
});

export default ViewSchedulePage;  