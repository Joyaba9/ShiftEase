import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import NavBar from '../../components/NavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchScheduleAPI } from '../../../backend/api/scheduleApi';
import { createWeeklyScheduleAPI, createShiftAPI } from '../../../backend/api/scheduleApi';
import { getTotalHoursColor } from '../../components/schedule_components/scheduleUtils';
import { getWeekDates, getDayView, getStartOfWeek } from '../../components/schedule_components/useCalendar';
import HeaderControls from '../../components/schedule_components/HeaderControls';
import EmployeeList from '../../components/schedule_components/EmployeeList';
import useEmployeeData from '../../components/schedule_components/useEmployeeData';
import ScheduleGrid from '../../components/ScheduleGrid';
import ShiftControls from '../../components/schedule_components/ShiftControls';

const SchedulePage = () => {
    
    // Get businessId from Redux store
    const loggedInUser = useSelector((state) => state.business.businessInfo);
    const businessId = loggedInUser?.business?.business_id;
    //console.log(loggedInUser);
    //console.log(businessId);

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

    console.log("Today's date:", new Date().toISOString().slice(0, 10));
    console.log("Current date state:", currentDate);
    console.log("Start of the week:", getStartOfWeek(currentDate));

    // Reference for the schedule grid (used for handling drag-and-drop)
    const scheduleGridRef = useRef(null);

    const dates = useMemo(() => {
        return view === 'week' ? getWeekDates(currentDate) : getDayView(currentDate);
    }, [view, currentDate]);
    const previousDatesRef = useRef(dates);

    // Default number of rows in the schedule grid
    const DEFAULT_ROW_COUNT = 8;
    const [rowCount, setRowCount] = useState(DEFAULT_ROW_COUNT);
    const [inputRowCount, setInputRowCount] = useState(String(rowCount));

    // States to manage the start and end times for new shifts
    const [newShiftStart, setNewShiftStart] = useState('');
    const [newShiftEnd, setNewShiftEnd] = useState('');

    const [scheduleId, setScheduleId] = useState(null);  // Store the schedule ID after creation
    const [shiftsData, setShiftsData] = useState([]);
    const [buttonText, setButtonText] = useState("Create Schedule");
    const [isLoading, setIsLoading] = useState(true);
    const [dataReady, setDataReady] = useState(false);

    // const sampleEmployeeAssignments = {
    //     "0-0": { f_name: "Jim", l_name: "Halpert" },
    //     "0-1": { f_name: "Jim", l_name: "Halpert" },
    //     "1-0": { f_name: "Pam", l_name: "Beesly" },
    //     "2-1": { f_name: "Dwight", l_name: "Schrute" },
    //     // Add more as needed for other cells
    // };
    
    // const sampleShiftAssignments = {
    //     "0-0": "09:00 - 17:00",
    //     "0-1": "09:00 - 17:00",
    //     "1-0": "10:00 - 18:00",
    //     "2-1": "12:00 - 20:00",
    //     // Add more as needed for other cells
    // };

    // const handleLoadSchedule = () => {
    //     // Simulate loading data by setting sample data as state
    //     setEmployeeAssignments(sampleEmployeeAssignments);
    //     setShiftAssignments(sampleShiftAssignments);
    // };

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
        setShiftTimes,
        setEmployeeAssignments,
        setShiftAssignments
    } = useEmployeeData(businessId);

    const normalizeAssignments = (assignments) => {
        const rowIndices = Object.keys(assignments).map(key => parseInt(key.split('-')[0], 10));
        const minRow = Math.min(...rowIndices);
    
        if (minRow > 0) {
            const normalized = {};
            Object.keys(assignments).forEach((key) => {
                const [row, col] = key.split('-').map(Number);
                const normalizedRow = row - minRow;
                const newKey = `${normalizedRow}-${col}`;
                normalized[newKey] = assignments[key];
            });
            return normalized;
        }
        return assignments; // Return as-is if it already starts from row 0
    };

    // Load the existing schedule and shifts when the component mounts
    useEffect(() => {
        const loadSchedule = async () => {
            setIsLoading(true);

            try {
                console.log("Trying to loadSchedule");

                // Get the start of the week based on currentDate
                const weekStartDate = getStartOfWeek(currentDate);
                console.log(currentDate);

                console.log("Business ID:", businessId, "Week Start Date:", weekStartDate);
    
                // Fetch schedule and shifts from the API
                const existingSchedule = await fetchScheduleAPI(businessId, weekStartDate);
                console.log("Existing Schedule: ", existingSchedule);
    
                if (existingSchedule && existingSchedule.schedule) {
                    setScheduleId(existingSchedule.schedule.schedule_id);
                    console.log("Schedule ID: ", existingSchedule.schedule.schedule_id);

                    setShiftsData(existingSchedule.shifts);
                    console.log("Loaded Shifts Data: ", existingSchedule.shifts);

                    setButtonText("Update Schedule");

                    // Wait until mapping is complete before setting isLoading to false
                    mapShiftsToAssignments(existingSchedule.shifts);
                } else {
                    setScheduleId(null);
                    setShiftsData([]);  // Clear shiftsData to allow new schedule creation
                    setButtonText("Create Schedule");
                }
            } catch (error) {
                console.error("Error loading schedule:", error);
                alert("Failed to load schedule. Please try again.");
            } finally {
                console.log("Schedule loaded, setting isLoading to false");
                setIsLoading(false); // End loading after setting data
            }
        };
        loadSchedule();
    }, [businessId, currentDate]);

    // Verify that dates are consistent and not changing unexpectedly
    useEffect(() => {
        console.log("Dates in useMemo:", dates);
    }, [dates]);

    //Trigger the mapping function whenever `shiftsData` changes
    useEffect(() => {
        if (shiftsData.length > 0 && dates.length > 0) {
            setDataReady(false);
            mapShiftsToAssignments(shiftsData);
            
        } else {
            setEmployeeAssignments({});
            setShiftAssignments({});
            setDataReady(true);
        }
    }, [shiftsData]);

    //Map shifts to assignments when shiftsData changes
    useEffect(() => {
        if (shiftsData.length > 0 && dates.length > 0) {
            mapShiftsToAssignments(shiftsData);
        }
    }, [shiftsData]);

    const mapShiftsToAssignments = (shifts) => {
        const loadedEmployeeAssignments = {};
        const loadedShiftAssignments = {};
    
        // Iterate over each shift object in `existingSchedule.shifts`
        shifts.forEach((shift) => {
            // Find the column index based on the date
            const colIndex = dates.findIndex(date => date.toISOString().split('T')[0] === shift.date.split('T')[0]);
    
            if (colIndex !== -1) {

                console.log("Comparing shift date:", shift.date.split('T')[0], "with dates array:", dates.map(date => date.toISOString().split('T')[0]));
                // Generate the cell ID based on employeeId and column index
                const cellId = `${shift.employeeId}-${colIndex}`;
    
                // Split the employeeName to get first and last name
                const [f_name, l_name] = shift.employeeName.split(' ');
    
                // Assign employee details to the corresponding cell
                loadedEmployeeAssignments[cellId] = { f_name, l_name };
    
                // Assign shift timing to the corresponding cell
                loadedShiftAssignments[cellId] = `${shift.startTime} - ${shift.endTime}`;
    
                console.log(`Mapped cell ${cellId}:`, loadedEmployeeAssignments[cellId], loadedShiftAssignments[cellId]);
            }
        });

        // Normalize the assignments to start from row 0
        const normalizedEmployeeAssignments = normalizeAssignments(loadedEmployeeAssignments);
        const normalizedShiftAssignments = normalizeAssignments(loadedShiftAssignments);
    
        // Log the final assignments to ensure they are correctly formatted
        console.log("Employee Assignments mapped (normalized):", normalizedEmployeeAssignments);
        console.log("Shift Assignments mapped (normalized):", normalizedShiftAssignments);

        setEmployeeAssignments(normalizedEmployeeAssignments);
        setShiftAssignments(normalizedShiftAssignments);
    };

    // useEffect(() => {
    //     if (Object.keys(employeeAssignments).length && Object.keys(shiftAssignments).length) {
    //         setRowCount(DEFAULT_ROW_COUNT);  // Force a re-render after assignments load
    //     }
    // }, [employeeAssignments, shiftAssignments]);

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
        //console.log("Drop gesture:", { moveX, moveY });
        if (scheduleGridRef.current && moveX && moveY) {
            //console.log("Calling handleDrop with:", moveX, moveY, employee, type);
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

    const handleCreateSchedule = async () => {
        console.log("Starting schedule creation...");
        if (!businessId) {
            console.error("Business ID is missing");
            return;
        }
    
        try {
            //const weekStartDate = currentDate.toISOString().slice(0, 10);
            const weekStartDate = getStartOfWeek(currentDate);
    
            // Create the weekly schedule
            const createdSchedule = await createWeeklyScheduleAPI(businessId, weekStartDate);
    
            // Loop through grid cells and save each shift
            for (const [cellId, shiftTime] of Object.entries(shiftAssignments)) {
                const employee = employeeAssignments[cellId];
                if (employee) {
                    const [startTime, endTime] = shiftTime.split(' - ');
                    
                    // Extract rowIndex and colIndex from cellId to get the date for this shift
                    const [, colIndex] = cellId.split('-');
                    
                    // Calculate the date for the shift based on the week start date and column index (day of the week)
                    const shiftDate = new Date(weekStartDate);
                    shiftDate.setDate(shiftDate.getDate() + parseInt(colIndex));
                    const formattedDate = shiftDate.toISOString().slice(0, 10); // Format to 'YYYY-MM-DD'
    
                    console.log("Creating shift for:", employee.emp_id, formattedDate, startTime.trim(), endTime.trim());  // Log before calling API

                    // Save shift for this employee on the specific date and time
                    await createShiftAPI(
                        employee.emp_id,
                        createdSchedule.scheduleId,
                        formattedDate,
                        startTime.trim(),
                        endTime.trim()
                    );
                }
            }
    
            alert("Schedule and shifts created successfully!");
    
        } catch (error) {
            console.error("Error creating schedule:", error);
            alert("Failed to create schedule. Please try again.");
        }
    };

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
                                
                                {/* {isLoading ? (
                                    <p>Loading schedule...</p>
                                ) : ( */}
                                    <ScheduleGrid
                                        ref={scheduleGridRef}
                                        dates={dates}
                                        employeeAssignments={employeeAssignments}
                                        shiftAssignments={shiftAssignments}
                                        rowCount = {rowCount}
                                        onDrop={onDrop}
                                        onRemove={onRemove}
                                    />
                                {/* )}    */}
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
        
                            <View style={styles.bottomInputContainer}>
                                <View style={styles.rowInputContainer}>
                                    <Text>Set Number of Rows:</Text>
                                    <TextInput
                                        style={styles.rowInput}
                                        value={inputRowCount}
                                        onChangeText={handleRowCountChange} 
                                        onBlur={handleRowCountBlur}
                                    />
                                </View>
                                <TouchableOpacity style={styles.createBtn} onPress={handleCreateSchedule}>
                                    <Text style = {{ color: '#fff' }}>{buttonText}</Text>
                                </TouchableOpacity>
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
    bottomInputContainer: {
        flexDirection: 'row',
        alignSelf: 'baseline',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '60%',
        height: '40%',
        paddingRight: 5,
    },
    rowInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'baseline'

    },
    createBtn: {
        alignSelf: 'baseline',
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
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