import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import NavBar from '../../components/NavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { getTotalHoursColor } from '../../components/schedule_components/scheduleUtils';
import { getWeekDates, getDayView } from '../../components/schedule_components/useCalendar';
import HeaderControls from '../../components/schedule_components/HeaderControls';
import EmployeeList from '../../components/schedule_components/EmployeeList';
import useEmployeeData from '../../components/schedule_components/useEmployeeData';
import ScheduleGrid from '../../components/ScheduleGrid';
import ShiftControls from '../../components/schedule_components/ShiftControls';

const SchedulePage = () => {
    // Get businessId from Redux store
    const loggedInUser = useSelector((state) => state.business.businessInfo);
    const businessId = loggedInUser?.business?.business_id;
    console.log(loggedInUser);
    console.log(businessId);

    const [maxHours, setMaxHours] = useState(500);  // Set initial max hours
    const [totalHours, setTotalHours] = useState(0);

    // State to control the visibility of the role filter dropdown
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [titleOption, setTitleOption] = useState('All');
    const filterOptions = ["All", "Managers", "Employees"];

    // State for calendar view (week or day)
    const [view, setView] = useState('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    console.log("Current date:", currentDate);

    // Reference for the schedule grid (used for handling drag-and-drop)
    const scheduleGridRef = useRef(null);
    // Get dates based on the selected view mode (week or day)
    const dates = view === 'week' ? getWeekDates(currentDate) : getDayView(currentDate);

    // Default number of rows in the schedule grid
    const DEFAULT_ROW_COUNT = 8;
    const [rowCount, setRowCount] = useState(DEFAULT_ROW_COUNT);
    const [inputRowCount, setInputRowCount] = useState(String(rowCount));

    // States to manage the start and end times for new shifts
    const [newShiftStart, setNewShiftStart] = useState('');
    const [newShiftEnd, setNewShiftEnd] = useState('');

    // Custom hook to handle employee and schedule-related data
    const { 
        employees, 
        filteredEmployees, 
        loading, 
        error, 
        employeeAssignments,
        shiftAssignments,
        shiftTimes,
        filterEmployees,  
        onDrop,        
        onRemove,
        setShiftTimes
    } = useEmployeeData(businessId);

    // Function to handle the selection of a role filter option
    const handleSelectTitle = (selectedTitle) => {
        setTitleOption(selectedTitle); // Update the selected title option
        setIsDropdownVisible(false);
    };

    // Effect to filter employees based on selected day and role
    useEffect(() => {
        if (selectedDay !== null) {
            // If a day is selected, filter by both availability and role
            const dayIndex = selectedDay;
            const selectedDate = dates[dayIndex];
            const dateToSend = selectedDate.toISOString().split('T')[0];
    
            // Filter employees based on availability and role
            filterEmployees(dayIndex, dateToSend, titleOption);
        } else {
            // If no day is selected, reset to initial display (by role only)
            filterEmployees(null, null, titleOption);
        }
    }, [selectedDay, titleOption, employees, filterEmployees]);

    // Effect to calculate total shift hours for all employees whenever employees change
    useEffect(() => {
        const calculatedHours = employees.reduce((acc, emp) => acc + emp.shiftHours, 0);
        setTotalHours(calculatedHours); // Update total hours state
    }, [employees]);

    // Function to handle drop events for assigning shifts
    const handleDrop = (gesture, employee, type) => {
        const { moveX, moveY } = gesture;
        console.log("Drop gesture:", { moveX, moveY });
        if (scheduleGridRef.current && moveX && moveY) {
            console.log("Calling handleDrop with:", moveX, moveY, employee, type);
            scheduleGridRef.current.handleDrop(moveX, moveY, employee, type);
        }
    };

    // Function to handle selection of days from the calendar header
    const handleDaySelection = (dayIndex) => {
        // If the same day is clicked again, clear the selection
        if (selectedDay === dayIndex) {
            setSelectedDay(null);  // Clear the day selection
        } else {
            setSelectedDay(dayIndex);  // Set the selected day
        }
    };

    // Handle changes in the row count input field
    const handleRowCountChange = (newCount) => {
        setInputRowCount(newCount);
    };

    // Update the row count when input loses focus, or reset if invalid
    const handleRowCountBlur = () => {
        const parsedCount = parseInt(inputRowCount, 10);
        if (!isNaN(parsedCount) && parsedCount > 0) {
            setRowCount(parsedCount);
        } else {
            setInputRowCount(String(rowCount));  // Reset input to current rowCount if invalid
        }
    };

    // Color calculation for total hours display based on current values
    const totalHoursColor = getTotalHoursColor(totalHours, maxHours);

    return (
        <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false} 
                showsHorizontalScrollIndicator={false}
        >
            <View style={styles.container}>
                <NavBar homeRoute={'Business'}/>

                {/* Dropdown menu for role filter */}
                {isDropdownVisible && (
                    <View style={styles.dropdownContainer}>
                        <FlatList
                            data={filterOptions}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.dropdownItem} 
                                    onPress={() => handleSelectTitle(item)}
                                >
                                    <Text style={styles.dropdownItemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>     
                )}

                <Text style={styles.dashboardText}> Manage Schedule</Text>
                
                {/* Section to display and set max hours and total hours */}
                <View style={styles.mainHoursContainer}>
                    <Text style={styles.hrTitle}>Max Desired Hours:</Text>
                    <TextInput
                        style={styles.maxHoursInput}
                        value={String(maxHours)}
                        //keyboardType="numeric"
                        onChangeText={(value) => setMaxHours(parseInt(value) || 0)}
                    />

                    <Text style={[styles.hrTitle, { color: totalHoursColor }]}>Total Hours: {totalHours}</Text>
                </View>
                <View style={styles.dashboardContainer}>
                    <View style={styles.wholeScheduleContainer}>
                        {/* Header controls for view mode and date selection */}
                        <HeaderControls 
                            view={view} 
                            currentDate={currentDate} 
                            setView={setView} 
                            setCurrentDate={setCurrentDate} 
                        />

                        <View style={styles.scheduleContainer}>
                            {/* Display list of employees with drag-and-drop support */}
                            <EmployeeList 
                                employees={filteredEmployees} 
                                handleDrop={handleDrop} 
                                filterOptions={filterOptions} 
                                selectedTitle={titleOption} 
                                setSelectedTitle={setTitleOption} 
                                dropdownVisible={isDropdownVisible}
                                setDropdownVisible={setIsDropdownVisible}
                            />

                            {/* Schedule grid for shifts */}
                            <View style={styles.gridContainer}>
                                {/* Render days of the week as headers */}
                                <View style={styles.gridHeader}>
                                    {dates.map((date, index) => (
                                        <TouchableOpacity 
                                            key={index} 
                                            style={[styles.gridHeaderCell, selectedDay === date.getDay() && styles.selectedDay]}
                                            onPress={() => handleDaySelection(date.getDay())}
                                        >
                                            <Text>{date.toDateString()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <ScheduleGrid
                                    ref={scheduleGridRef}
                                    dates={dates}
                                    employeeAssignments={employeeAssignments}
                                    shiftAssignments={shiftAssignments}
                                    rowCount = {rowCount}
                                    onDrop={onDrop}
                                    onRemove={onRemove}
                                />
                            </View>
                        </View>
                        
                        {/* Controls for adding shifts and setting row count */}
                        <View style={styles.bottomShiftContainer}>
                            <ShiftControls 
                                shiftTimes={shiftTimes} 
                                setShiftTimes={setShiftTimes}
                                newShiftStart={newShiftStart} 
                                newShiftEnd={newShiftEnd} 
                                setNewShiftStart={setNewShiftStart} 
                                setNewShiftEnd={setNewShiftEnd} 
                                handleDrop={handleDrop} 
                            />

                            <View style={styles.rowInputContainer}>
                                <Text>Set Number of Rows:</Text>
                                <TextInput
                                    style={styles.rowInput}
                                    value={inputRowCount}
                                    onChangeText={handleRowCountChange} 
                                    onBlur={handleRowCountBlur}
                                />
                            </View>  
                        </View>
                    </View>
                </View>
                {/* Bottom Bar with Logo */}
                <LinearGradient colors={['#E7E7E7', '#9DCDCD']} style={styles.bottomBarContainer}>
                            <Image resizeMode="contain" source={require('../../assets/images/logo1.png')} style={styles.desktopLogo} />
                </LinearGradient>
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
    dropdownContainer: {
        position: 'absolute', 
        width:'20%',
        borderColor: 'gray',
        borderWidth: 1,
        backgroundColor: '#fff',
        borderRadius: 5,
        zIndex: 9999,
        top: 394, 
        left: 75,
        right: 75,
        maxHeight: 200,
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    dropdownItemText: {
        fontSize: 16,
    },
    dashboardText: {
        fontSize: 30,
        alignSelf: 'flex-start',
        marginVertical: 40,
        marginLeft: 30
    },
    mainHoursContainer: {
        flexDirection: 'row',
        width: '95%',
        minHeight: '5%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: 10,
    },
    maxHoursInput: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        padding: 5,
        marginLeft: 10,
        marginRight: 30,
        width: 55,
        textAlign: 'center',
    },
    hrTitle: {
        fontSize: 18
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
        flexDirection: 'row',
        width: '100%',
        minHeight: '50%',
        alignSelf: 'center',
        minHeight: '45%',
    },
    gridContainer: {
        position: 'relative',
        width: '75%',
        flexDirection: 'column',
        alignSelf: 'stretch',
        overflow: 'hidden',
        zIndex: 1
    },
    gridHeader: {
        flex:1,
        flexDirection: 'row',
        maxWidth: '100%',
        maxHeight: 50,
        overflow: 'hidden',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        position: 'relative',
        zIndex: 1
    },
    gridHeaderCell: {
        flex:1,
        minWidth: '14.29%',
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#e7e7e7',
        borderRightWidth: 1,
        borderRightColor: '#ccc',
        zIndex: 1
    },
    selectedDay: {
        backgroundColor: '#e8f5e9',
    },
    bottomShiftContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowInputContainer: {
        flexDirection: 'row',
        alignSelf: 'baseline',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '20%',
        paddingRight: 5,
    },
    rowInput: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        padding: 5,
        marginLeft: 10,
        width: 50,
        textAlign: 'center',
    },
    bottomBarContainer: {
        width: '100%',
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    desktopLogo: {
        position: 'relative',
        left: 40,
        width: 230,
        height: 100,
        alignSelf: 'flex-end',
    },
});

export default SchedulePage;   