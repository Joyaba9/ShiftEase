import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import NavBar from '../../components/NavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchScheduleAPI } from '../../../backend/api/scheduleApi';
import { createWeeklyScheduleAPI, createShiftAPI, updateShiftAPI, removeShiftAPI } from '../../../backend/api/scheduleApi';
import { getTotalHoursColor, formatTime, calculateHoursDifference, convertRangeTo24HourFormat, convertTo24HourFormat } from '../../components/schedule_components/scheduleUtils';
import { getWeekDates, getDayView, getStartOfWeek } from '../../components/schedule_components/useCalendar';
import HeaderControls from '../../components/schedule_components/HeaderControls';
import EmployeeList from '../../components/schedule_components/EmployeeList';
import useEmployeeData from '../../components/schedule_components/useEmployeeData';
import ScheduleGrid from '../../components/ScheduleGrid';
import ShiftControls from '../../components/schedule_components/ShiftControls';

const SchedulePage = () => {

    // Get loggedInUser from Redux store for both business and employee
    const businessInfo = useSelector((state) => state.business.businessInfo);
    const loggedInUser = useSelector((state) => state.user.loggedInUser);

    // Determine businessId based on user type
    const businessId = businessInfo?.business?.business_id || loggedInUser?.employee?.business_id;
    const homeRoute = businessInfo?.business ? 'Business' : loggedInUser?.employee ? 'Employee' : 'Login';
    
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

    // console.log("Today's date:", new Date().toISOString().slice(0, 10));
    // console.log("Current date state:", currentDate);
    // console.log("Start of the week:", getStartOfWeek(currentDate));

    // Reference for the schedule grid (used for handling drag-and-drop)
    const scheduleGridRef = useRef(null);

    const dates = useMemo(() => {
        return view === 'week' ? getWeekDates(currentDate) : getDayView(currentDate);
    }, [view, currentDate]);

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
    const [tempMessage, setTempMessage] = useState(null);
    
    //console.log("Computed dates:", dates);

    const showTemporaryMessage = (message) => {
        setTempMessage(message);
        setTimeout(() => setTempMessage(null), 5000);
    };
    
    // Custom hook to handle employee and schedule-related data
    const { 
        employees, 
        filteredEmployees, 
        employeeAssignments,
        shiftAssignments,
        shiftTimes,
        filterEmployees,  
        onDrop,        
        onRemove,
        setShiftTimes,
        setEmployeeAssignments,
        setShiftAssignments
    } = useEmployeeData(businessId, scheduleId, dates, showTemporaryMessage);//view, currentDate

    // Load the existing schedule and shifts when the component mounts
    useEffect(() => {
        const loadSchedule = async () => {
            setIsLoading(true);

            try {
                console.log("Trying to loadSchedule");

                // Get the start of the week based on currentDate
                const weekStartDate = getStartOfWeek(currentDate).toISOString().split('T')[0];
                console.log("Business ID:", businessId, "Week Start Date:", weekStartDate);
    
                // Fetch schedule and shifts from the API
                const existingSchedule = await fetchScheduleAPI(businessId, weekStartDate);
                console.log("Existing Schedule: ", existingSchedule);
                
                if (existingSchedule && existingSchedule.schedule) {
                    const scheduleId = existingSchedule.schedule.schedule_id;

                    setScheduleId(scheduleId);
                    console.log("Schedule ID: ", scheduleId);

                    setButtonText("Update Schedule");

                    setShiftsData(existingSchedule.shifts);
                    console.log("Loaded Shifts Data: ", existingSchedule.shifts);

                    mapShiftsToAssignments(existingSchedule.shifts);
                    
                } else {
                    setScheduleId(null);
                    setShiftsData([]);  

                    // Reset totalHours and shiftHours
                    setTotalHours(0);
                    employees.forEach((emp) => {
                        emp.shiftHours = 0;
                    });
                    setEmployeeAssignments(employees);

                    setButtonText("Create Schedule");
                    console.log("No existing schedule for the week. Ready to create a new schedule.");
                }
            } catch (error) {
                console.error("Error loading schedule:", error);
                //alert("Failed to load schedule. Please try again.");
            } finally {
                console.log("Schedule loaded, setting isLoading to false");
                setIsLoading(false); // End loading after setting data
            }
        };
        loadSchedule();
    }, [businessId, currentDate]);

    // Verify that dates are consistent and not changing unexpectedly
    // useEffect(() => {
    //     console.log("Dates in useMemo:", dates);
    // }, [dates]);

    // Map shifts to assignments whenever shiftsData changes
    useEffect(() => {
        if (shiftsData.length > 0 && dates.length > 0 && scheduleId) {
            mapShiftsToAssignments(shiftsData, scheduleId);
        }
    }, [shiftsData, dates, scheduleId]);

    const mapShiftsToAssignments = (shifts) => {
        const loadedEmployeeAssignments = {};
        const loadedShiftAssignments = {};
        let totalHours = 0;
        const employeeHoursMap = {};

        // Iterate over each shift object in `existingSchedule.shifts`
        shifts.forEach((shift) => {
            
            // Format shift date to 'YYYY-MM-DD'
            const shiftDateFormatted = new Date(shift.date).toISOString().split('T')[0];
            console.log('Formatted Shift Date: ', shiftDateFormatted)
            
            // Map each date in dates array to 'YYYY-MM-DD' format for comparison
            const formattedDates = dates.map(date => date.toISOString().split('T')[0]);
            console.log('Formatted Dates: ', formattedDates)
            
            // Find the column index for the shift date
            const colIndex = formattedDates.findIndex(date => date === shiftDateFormatted);

            if (colIndex !== -1) {
                // Get the saved employee ID and find the row index from shifts data 
                const rowIndex = shift.rowIndex ?? 0;
                console.log("RowIndex: ", rowIndex);
                if (rowIndex === undefined) {
                    console.warn(`No row index found for employee ID ${shift.employeeId}; defaulting to row 0.`);
                }
                const safeRowIndex = rowIndex ?? 0;
                // Generate the cell ID based on employeeId and column index
                const cellId = `${safeRowIndex}-${colIndex}`;
    
                // Split the employeeName to get first and last name
                const [f_name, l_name] = shift.employeeName.split(' ');
    
                // Assign employee details to the corresponding cell
                loadedEmployeeAssignments[cellId] = { f_name, l_name };
    
                // Assign shift timing to the corresponding cell
                loadedShiftAssignments[cellId] = `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`;
                console.log(`Mapped cell ${cellId}:`, loadedEmployeeAssignments[cellId], loadedShiftAssignments[cellId]);
            
                // Calculate shift hours for the employee
                const shiftHours = calculateHoursDifference(shift.startTime, shift.endTime);
                console.log(`Shift hours calculated for ${f_name} ${l_name}: ${shiftHours}`);

                totalHours += shiftHours;
            
                // Add hours to the employee's total
                if (!employeeHoursMap[shift.employeeId]) {
                    employeeHoursMap[shift.employeeId] = 0;
                }
                employeeHoursMap[shift.employeeId] += shiftHours;
        
            }
        });

        // Update state with recalculated hours
        employees.forEach(emp => {
            emp.shiftHours = employeeHoursMap[emp.emp_id] || 0;
            console.log(`Updated shift hours for ${emp.f_name} ${emp.l_name}: ${emp.shiftHours}`);
        });
        setTotalHours(totalHours);
        setEmployeeAssignments(loadedEmployeeAssignments);
        setShiftAssignments(loadedShiftAssignments);

        console.log("Calculated total hours:", totalHours);
        console.log("Updated employee shift hours:", employees);
    };

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
            const weekStartDate = getStartOfWeek(currentDate);
            console.log('Week start date: ', weekStartDate);
    
            const formattedWeekStartDate = `${weekStartDate.getFullYear()}-${(weekStartDate.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${weekStartDate.getDate().toString().padStart(2, '0')}`;
            console.log('Formatted week start date: ', formattedWeekStartDate);
    
            // Create the weekly schedule
            const createdSchedule = await createWeeklyScheduleAPI(businessId, formattedWeekStartDate);
    
            const newMapping = {};
            const employeeHours = {};
            const updatedEmployeeAssignments = { ...employeeAssignments };
    
            // Recalculate each employee's shift hours
            for (const [cellId, shiftTime] of Object.entries(shiftAssignments)) {
                const employee = updatedEmployeeAssignments[cellId];
                if (employee && shiftTime) {
                    console.log(`Processing shift time: ${shiftTime}`);
                    const [startTimeStr, endTimeStr] = shiftTime.split(' - ');
    
                    // Validate before converting to 24-hour format
                    if (startTimeStr && endTimeStr) {
                        const startTime = convertTo24HourFormat(startTimeStr.trim());
                        const endTime = convertTo24HourFormat(endTimeStr.trim());
                        const shiftHours = calculateHoursDifference(startTime, endTime);
    
                        employee.shiftHours = (employee.shiftHours || 0) + shiftHours;
                        console.log(`Calculated shift hours for employee ${employee.emp_id}:`, employee.shiftHours);
                    } else {
                        console.error(`Invalid shift time format for ${shiftTime}. Expected "start - end" format.`);
                    }
                }
            }
    
            // Loop through grid cells and save each shift
            for (const [cellId, shiftTime] of Object.entries(shiftAssignments)) {
                const employee = employeeAssignments[cellId];
                if (employee && shiftTime) {
                    const [rowIndex, colIndex] = cellId.split('-');
                    newMapping[employee.emp_id] = parseInt(rowIndex, 10);
    
                    const [startTimeStr, endTimeStr] = shiftTime.split(' - ');
                    if (startTimeStr && endTimeStr) {
                        const startTime = convertTo24HourFormat(startTimeStr.trim());
                        const endTime = convertTo24HourFormat(endTimeStr.trim());
    
                        // Calculate the date for the shift
                        const shiftDate = new Date(weekStartDate);
                        shiftDate.setDate(shiftDate.getDate() + parseInt(colIndex));
                        const formattedDate = shiftDate.toISOString().slice(0, 10);
    
                        console.log("Creating shift for:", employee.emp_id, formattedDate, startTime, endTime, parseInt(rowIndex, 10));
    
                        // Save shift with 24-hour format times
                        await createShiftAPI(
                            employee.emp_id,
                            createdSchedule.scheduleId,
                            formattedDate,
                            startTime,
                            endTime,
                            parseInt(rowIndex, 10)
                        );
    
                        // Store employee shift hours
                        employeeHours[employee.emp_id] = employee.shiftHours;
                    } else {
                        console.error(`Invalid shift time format for ${shiftTime}. Expected "start - end" format.`);
                    }
                }
            }
            
            alert("Schedule and shifts created successfully!");
    
        } catch (error) {
            console.error("Error creating schedule:", error);
            alert("Failed to create schedule. Please try again.");
        }
    };

    const handleUpdateSchedule = async () => {
        console.log('Dates:', dates);
        console.log('Shifts Data:', shiftsData);

        try {
            // Iterate over each shift in the previously loaded schedule
            for (const previousShift of shiftsData) {
                // Construct cellId for the previous shift
                const colIndex = dates.findIndex(
                    date => new Date(date).toISOString().split('T')[0] === previousShift.date.split('T')[0]
                );
                const cellId = `${previousShift.rowIndex}-${colIndex}`;

                // Log previous shift and cellId
                console.log('Checking previous shift:', previousShift);
                console.log('Calculated cellId:', cellId);

                const currentShiftTime = shiftAssignments[cellId];

                if (!currentShiftTime) {
                    // The cell is empty, but there was a shift before - remove it
                    if (previousShift.shiftId) {
                        await removeShiftAPI(previousShift.shiftId);
                        console.log(`Removed shift for cell ${cellId}`);
                    } else {
                        console.warn(`Shift ID missing for previous shift in cell ${cellId}`);
                    }
                } else if (currentShiftTime) {
                    const [newStartTime, newEndTime] = currentShiftTime.split(' - ').map(convertTo24HourFormat);

                    if (
                        newStartTime !== previousShift.startTime ||
                        newEndTime !== previousShift.endTime
                    ) {
                        // Update the shift if the times have changed
                        await updateShiftAPI(
                            previousShift.shiftId,
                            newStartTime,
                            newEndTime,
                            `Shift on ${previousShift.date}`
                        );
                        console.log(`Updated shift for cell ${cellId}`);
                    }
                }
            }

            // Handle new shifts added in the grid but not present in shiftsData
            for (const cellId in employeeAssignments) {
                const employee = employeeAssignments[cellId];
                const currentShiftTime = shiftAssignments[cellId];
                const [rowIndex, colIndex] = cellId.split('-').map(Number);
                const shiftDate = new Date(dates[colIndex]).toISOString().split('T')[0];

                if (
                    currentShiftTime &&
                    !shiftsData.some(
                        shift =>
                            `${shift.rowIndex}-${dates.findIndex(date => new Date(date).toISOString().split('T')[0] === shift.date.split('T')[0])}` === cellId
                    )
                ) {
                    // A new shift is present in the grid but not in the loaded data - create it
                    if (employee && employee.emp_id) {
                        const [startTime, endTime] = currentShiftTime.split(' - ').map(convertTo24HourFormat);
                        await createShiftAPI(employee.emp_id, scheduleId, shiftDate, startTime, endTime, rowIndex);
                        console.log(`Created new shift for cell ${cellId}`);
                    }
                }
            }

            alert('Schedule updated successfully!');
        } catch (error) {
            console.error('Error updating schedule:', error);
            alert('Failed to update schedule. Please try again.');
        }
    };

    return (
        <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false} 
                showsHorizontalScrollIndicator={false}
        >
            <View style={styles.container}>
                <NavBar homeRoute={homeRoute} showLogout={false}/>

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
                    {tempMessage && (
                        <Text style={{color: 'red', fontSize: 15, marginRight: 10}}>{tempMessage}</Text>
                        
                    )}

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
                                <TouchableOpacity 
                                    style={styles.createBtn} 
                                    onPress={buttonText === "Create Schedule" ? handleCreateSchedule : handleUpdateSchedule}
                                >
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
        minHeight: '80%',
        marginBottom: 70,
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