import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Dimensions, View, Button, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated, PanResponder, FlatList } from 'react-native';
import NavBar from '../../components/NavBar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDateRangeText, changeDate, getWeekDates, getDayView } from '../../components/useCalendar';
import ScheduleGrid from '../../components/ScheduleGrid';
import { useSelector } from 'react-redux';
import { fetchEmployeesWithRoles } from '../../../backend/api/employeeApi';
import { fetchAvailableEmployees } from '../../../backend/api/employeeApi';

const { width, height } = Dimensions.get('window');

const SchedulePage = () => {

    // Get businessId from Redux store
    const loggedInUser = useSelector((state) => state.business.businessInfo);
    const businessId = loggedInUser?.business?.business_id;
    console.log(loggedInUser);
    console.log(businessId);

    const [view, setView] = useState('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    console.log("Current date:", currentDate);

    const dates = view === 'week' ? getWeekDates(currentDate) : getDayView(currentDate);

    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [titleOption, setTitleOption] = useState('All');
    const filterOptions = ["All", "Managers", "Employees"];

    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const [selectedDay, setSelectedDay] = useState(null); // Track selected day in header
    const [availableEmployees, setAvailableEmployees] = useState([]);

    const [shiftTimes, setShiftTimes] = useState([]);
    const [newShiftStart, setNewShiftStart] = useState('');
    const [newShiftEnd, setNewShiftEnd] = useState('');
    const [employeeAssignments, setEmployeeAssignments] = useState({});
    const [shiftAssignments, setShiftAssignments] = useState({});
    const scheduleGridRef = useRef(null);

    const DEFAULT_ROW_COUNT = 8;
    const [rowCount, setRowCount] = useState(DEFAULT_ROW_COUNT);
    const [inputRowCount, setInputRowCount] = useState(String(rowCount));

    // Fetch employees from the backend API
    const getEmployees = useCallback(async () => {
        console.log("Trying to fetch employees");
        setLoading(true);
        setError(null);
        
        try {
            const data = await fetchEmployeesWithRoles(businessId); // Fetch employees based on the businessId

            // Add `pan` property with Animated.ValueXY for drag functionality
            const employeesWithPan = data.map((employee) => ({
                ...employee,
                pan: new Animated.ValueXY(),
                shiftHours: 0
            }));

            setEmployees(employeesWithPan);
            console.log("Employees with roles: ", employeesWithPan)
            setFilteredEmployees(employeesWithPan);
        } catch (error) {
            setError('Error fetching employees');
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    // Fetch employees when component mounts or when businessId changes
    useEffect(() => {
        if (businessId) {
        getEmployees();
        }
    }, [businessId, getEmployees]);

    // Filter employees based on selected day and title option
    const filterEmployees = useCallback(async (dayIndex, dateToSend) => {
        // Ensure dayIndex is a valid number
        if (dayIndex === undefined || dateToSend === undefined) {
            console.error("Day index or date to send is undefined.");
            return;
        }

        // Convert day index to day name
        const dayName = dayNames[dayIndex];
        console.log("Day to send:", dayName);
        console.log("Date to send:", dateToSend);

        try {
            // Fetch employees available on the selected day and date
            const result = await fetchAvailableEmployees(businessId, dayName, dateToSend);
            const { employees: availableEmployees } = result;

            // Add `pan` property for drag functionality if missing
            const employeesWithPan = availableEmployees.map((employee) => ({
                ...employee,
                pan: employee.pan || new Animated.ValueXY(),
            }));

            // Apply role filter (All, Managers, Employees)
            const roleFilteredEmployees = employeesWithPan.filter((emp) => {
                if (titleOption === "Managers") return emp.role_name === "Manager";
                if (titleOption === "Employees") return emp.role_name === "Employee";
                return true;
            });

            console.log("Filtered Employees with Pan:", roleFilteredEmployees);

            setFilteredEmployees(roleFilteredEmployees);
        } catch (error) {
            console.error("Error fetching available employees:", error);
        }   
    }, [titleOption, employees]);

    useEffect(() => {
        if (selectedDay !== null) {
            // Calculate day name and date to send based on selectedDay and currentDate
            const dayIndex = selectedDay;
            const selectedDate = dates[dayIndex];
            const dateToSend = selectedDate.toISOString().split('T')[0];
    
            filterEmployees(dayIndex, dateToSend);
        } else {
            setFilteredEmployees(employees);  // Display all employees when no day is selected
        }
    }, [selectedDay, titleOption, employees, filterEmployees]);

    useEffect(() => {
        console.log("Updated Employees:", employees);
    }, [employees]); 

    // Loading or error handling can be added here as needed
    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>{error}</Text>;

    
    const handleSelectTitle = (selectedTitle) => {
        setTitleOption(selectedTitle);
        setFilteredEmployees(employees);  // Reset filter initially
        if (selectedDay !== null) {
            handleDaySelection(selectedDay);  // Re-filter if a day is selected
        }
        setIsDropdownVisible(false);
    };

    // Handle day selection from header
    const handleDaySelection = (dayIndex) => {
        setSelectedDay(dayIndex);

        const selectedDate = dates[dayIndex];
        const dateToSend = selectedDate.toISOString().split('T')[0];
        console.log("Date to send:", dateToSend);

        filterEmployees(dayIndex, dateToSend);
    };

    const handleRowCountChange = (newCount) => {
        setInputRowCount(newCount);
    };

    const handleRowCountBlur = () => {
        const parsedCount = parseInt(inputRowCount, 10);
        if (!isNaN(parsedCount) && parsedCount > 0) {
            setRowCount(parsedCount);
        } else {
            setInputRowCount(String(rowCount));  // Reset input to current rowCount if invalid
        }
    };
    
    // Handle adding a new shift
    const handleAddShift = () => {
        if (newShiftStart && newShiftEnd) {
            const newShift = {
                id: (shiftTimes.length + 1).toString(),
                time: `${newShiftStart} - ${newShiftEnd}`,
                assigned: false,
                pan: new Animated.ValueXY(),
            };
            setShiftTimes((prev) => [...prev, newShift]);
            setNewShiftStart('');
            setNewShiftEnd('');
        }
    };

    // Handle drop by setting employee assignment
    const handleDrop = (gesture, employee, type) => {
        const { moveX, moveY } = gesture;
        console.log("Drop gesture:", { moveX, moveY });
        if (scheduleGridRef.current && moveX && moveY) {
            console.log("Calling handleDrop with:", moveX, moveY, employee, type);
            scheduleGridRef.current.handleDrop(moveX, moveY, employee, type);
        }
    };

    const onDrop = (cellId, item, type) => {
        console.log("onDrop called with:", cellId, item, type);
    
        if (type === 'shift') {
            console.log("Type is 'shift'");
    
            // Update shiftAssignments with the shift time for the specific cellId
            setShiftAssignments((prev) => {
                const updatedAssignments = { ...prev, [cellId]: item.time };
                console.log("Updated shiftAssignments:", updatedAssignments);
    
                // Check if an employee is already assigned to this cell
                const assignedEmployee = employeeAssignments[cellId];
                if (assignedEmployee) {
                    const [start, end] = item.time.split(' - ');
                    const hours = calculateHoursDifference(start, end);
    
                    console.log(`Calculated hours for employee ${assignedEmployee.emp_id}:`, hours);
    
                    // Accumulate hours for this employee
                    setEmployees((prev) =>
                        prev.map((emp) =>
                            emp.emp_id === assignedEmployee.emp_id ? { ...emp, shiftHours: emp.shiftHours + hours } : emp
                        )
                    );
                }
                return updatedAssignments;
            });
    
        } else if (type === 'employee') {
            console.log("Type is 'employee'");
    
            // Update employeeAssignments with the employee for the specific cellId
            setEmployeeAssignments((prev) => {
                const updatedAssignments = { ...prev, [cellId]: item };
                console.log("Updated employeeAssignments:", updatedAssignments);
    
                // Check if a shift is already assigned to this cell
                const assignedShift = shiftAssignments[cellId];
                if (assignedShift) {
                    const [start, end] = assignedShift.split(' - ');
                    const hours = calculateHoursDifference(start, end);
    
                    console.log(`Calculated hours for employee ${item.emp_id}:`, hours);
    
                    // Accumulate hours for this employee
                    setEmployees((prev) =>
                        prev.map((emp) =>
                            emp.emp_id === item.emp_id ? { ...emp, shiftHours: emp.shiftHours + hours } : emp
                        )
                    );
                }
                return updatedAssignments;
            });
        }
    };

    const calculateHoursDifference = (startTime, endTime) => {
        console.log("Calculating hours between:", startTime, endTime);

        const [startHour, startMinutes] = startTime.split(/[: ]/).map((val, index) => index === 0 ? parseInt(val) % 12 : parseInt(val));
        const [endHour, endMinutes] = endTime.split(/[: ]/).map((val, index) => index === 0 ? parseInt(val) % 12 : parseInt(val));
    
        const startDate = new Date();
        startDate.setHours(startHour, startMinutes, 0);
    
        const endDate = new Date();
        endDate.setHours(endHour + (endTime.includes('PM') ? 12 : 0), endMinutes, 0);
    
        // Calculate difference in hours
        const hours = Math.abs((endDate - startDate) / (1000 * 60 * 60));
        console.log("Calculated hours difference:", hours);

        return hours;
    };

    const onRemove = (cellId, type) => {
        if (type === 'employee') {
            const employeeName = employeeAssignments[cellId];
            setEmployeeAssignments((prev) => {
                const newAssignments = { ...prev };
                delete newAssignments[cellId];
                return newAssignments;
            });
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.name === employeeName ? { ...emp, assigned: false, pan: new Animated.ValueXY() } : emp
                )
            );
        } else if (type === 'shift') {
            const shiftTime = shiftAssignments[cellId];
            setShiftAssignments((prev) => {
                const newAssignments = { ...prev };
                delete newAssignments[cellId];
                return newAssignments;
            });
            setShiftTimes((prev) =>
                prev.map((shift) =>
                    shift.time === shiftTime ? { ...shift, assigned: false, pan: new Animated.ValueXY() } : shift
                )
            );
        }
    };

    return (
        <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false} 
                showsHorizontalScrollIndicator={false}
        >
            <View style={styles.container}>
                <NavBar homeRoute={'Business'}/>

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

                <View style={styles.dashboardContainer}>
                    <View style={styles.wholeScheduleContainer}>
                        <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style = {styles.topContainer}>
                            <View style={styles.calendarButtonsContainer}>
                                <TouchableOpacity 
                                    style={[styles.calendarButton, view === 'week' && styles.activeView]} 
                                    onPress={() => setView('week')}
                                >
                                    <Text style={styles.buttonText}>Week</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.calendarButton, view === 'day' && styles.activeView]} 
                                    onPress={() => setView('day')}
                                >
                                    <Text style={styles.buttonText}>Day</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.dateText}>
                                {getDateRangeText(view, currentDate)}
                            </Text>

                            <View style={styles.arrowButtons}>
                                <TouchableOpacity 
                                    style={styles.arrow} 
                                    onPress={() => setCurrentDate(changeDate(view, currentDate, 'prev'))}
                                >
                                    <Ionicons name="arrow-back-outline" size={15} color="black" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.arrow} 
                                    onPress={() => setCurrentDate(changeDate(view, currentDate, 'next'))}
                                >
                                    <Ionicons name="arrow-forward-outline" size={15} color="black" />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                        <View style={styles.scheduleContainer}>
                            <View style={styles.employeeContainer}>
                                <View style={[styles.employeeTopContainer, { zIndex: isDropdownVisible ? 1 : 0 }]}>
                                    <Text style={styles.title}> {titleOption === "All" ? "All Team Members" : titleOption}</Text>

                                    <TouchableOpacity 
                                        style={styles.dropdownButton} 
                                        onPress={() => setIsDropdownVisible((prev) => !prev)}
                                    >
                                        <Text style={styles.dropdownText}>{titleOption}</Text>
                                    </TouchableOpacity>

                                    
                                </View>
                                    <ScrollView 
                                        contentContainerStyle={{ flexGrow: 1, paddingVertical: 10 }}
                                        showsVerticalScrollIndicator={false} 
                                        showsHorizontalScrollIndicator={false}
                                    >
                                        {filteredEmployees.map((employee) => (
                                            <AnimatedEmployeeItem 
                                                key={employee.emp_id} 
                                                employee={employee}
                                                handleDrop={handleDrop}
                                            />
                                        ))}
                                    </ScrollView>
                            </View>
                            
                            {/* Grid for the shifts */}
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

                        <View style={styles.bottomShiftContainer}>
                                <Text>Set Number of Rows:</Text>
                                <TextInput
                                    style={styles.rowInput}
                                    value={inputRowCount}
                                    //keyboardType="numeric"
                                    onChangeText={handleRowCountChange}  // Update row count dynamically
                                    onBlur={handleRowCountBlur}
                                />
                        </View>
                    </View>

                    <View style={styles.shiftContainer}>
                        <Text style={styles.sectionTitle}>Add Shift Time</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Start Time"
                                value={newShiftStart}
                                onChangeText={setNewShiftStart}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="End Time"
                                value={newShiftEnd}
                                onChangeText={setNewShiftEnd}
                            />
                            <Button title="Add Shift" onPress={handleAddShift} />
                        </View>
                        

                        <Text style={styles.sectionTitle}>Shift Times</Text>
                        {shiftTimes.filter(shift => !shift.assigned).map((shift) => {
                            const panResponder = PanResponder.create({
                                onStartShouldSetPanResponder: () => true,
                                onPanResponderMove: Animated.event(
                                    [null, { dx: shift.pan.x, dy: shift.pan.y }],
                                    { useNativeDriver: false }
                                ),
                                onPanResponderRelease: (e, gesture) => {
                                    handleDrop(gesture, shift, 'shift'); // Type is 'shift'
                                    Animated.spring(shift.pan, {
                                        toValue: { x: 0, y: 0 },
                                        useNativeDriver: false,
                                    }).start();
                                },
                            });

                            return (
                                <Animated.View
                                    key={shift.id}
                                    {...panResponder.panHandlers}
                                    style={[shift.pan.getLayout(), styles.draggableShifts, { backgroundColor: 'lightgreen' }]}
                                >
                                    <Text style={styles.text}>{shift.time}</Text>
                                </Animated.View>
                            );
                        })}
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

// Helper function to convert time to 12-hour format with AM/PM
const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM/PM
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

// Subcomponent for each employee to handle dragging
const AnimatedEmployeeItem = ({ employee, handleDrop }) => {
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: employee.pan.x, dy: employee.pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        handleDrop(gesture, employee, 'employee');
        Animated.spring(employee.pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
        }).start();
    },
    });

    // Check if availability text is present
    const hasAvailability = employee.start_time && employee.end_time;
  
    return (
      <Animated.View {...panResponder.panHandlers} style={[employee.pan.getLayout(), styles.draggable]}>
        <LinearGradient 
            colors={['#E7E7E7', '#A7CAD8']} 
            style = {[styles.gradient, hasAvailability && styles.expandedGradient]}
        >
            <View style={styles.topEmployeeItem}>
                <Text>{`${employee.f_name} ${employee.l_name}`}</Text>
                <Text>Hrs: {employee.shiftHours}</Text>
            </View>
            <Text style={styles.roleText}>{employee.role_name}</Text>

            {/* Display start and end time if available */}
            {hasAvailability && (
                <Text style={styles.availabilityText}>
                    {`Available: ${formatTime(employee.start_time)} - ${formatTime(employee.end_time)}`}
                </Text>
            )}
        </LinearGradient>
      </Animated.View>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1, 
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 20,
        minHeight: '100%',
        height: 200,
        minWidth: 950,
        userSelect: 'none',
        backgroundColor: 'white'
    },
    dashboardContainer: {
        flexGrow: 1,
        width: '100%',
        alignItems: 'center',
        marginBottom: 50,
        backgroundColor: 'white'
    },
    dashboardText: {
        fontSize: 30,
        alignSelf: 'flex-start',
        marginVertical: 40,
        marginLeft: 30
    },
    wholeScheduleContainer: {
        //flex: 1,
        width: '95%',
        minWidth: '60%',
        minHeight: '60%',
        // borderWidth: 2,
        // borderColor: 'orange'
    },
    topContainer: {
        flexDirection: 'row',
        height: 80,
        width: '100%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 30,
        backgroundColor: 'white',
        // borderBottomWidth: 1,
        // borderBottomColor: '#ccc',
    },
    calendarButtonsContainer: {
        flexDirection: 'row',
        marginLeft: 20,
        //borderWidth: 2,
        //borderColor: 'black'
    },
    calendarButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 5,
        paddingHorizontal: 10,
        //borderRadius: 10,
        marginVertical: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    buttonText: {
        fontSize: 12
    },
    activeView: {
        backgroundColor: '#A7CAD8',
    },
    arrowButtons: {
        flexDirection: 'row',
        marginRight: 20
    },
    arrow: {
        backgroundColor: '#ffffff',
    },
    scheduleContainer: {
        flexDirection: 'row',
        width: '100%',
        minHeight: '50%',
        alignSelf: 'center',
        minHeight: '45%',
        // borderWidth: 1,
        // borderColor: 'black'
    },
    employeeTopContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    title: {
        fontSize: 18,
        marginBottom: 10,
    },
    dropdownButton: {
        height: 30,
        width: '25%',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        justifyContent: 'center',
        borderRadius: 5,
    },
    dropdownText: {
        color: 'gray',
    },
    dropdownContainer: {
        position: 'absolute', 
        width:'20%',
        borderColor: 'gray',
        borderWidth: 1,
        backgroundColor: '#fff',
        borderRadius: 5,
        zIndex: 9999,
        top: 339, 
        left: 75,
        right: 0,
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
    employeeContainer: { 
        position: 'relative',
        width: '25%',
        maxHeight: 610,
        padding: 10,
        backgroundColor: '#f7f7f7',
        borderRightWidth: 1,
        borderRightColor: '#ccc',
        marginBottom: 20,
    },
    topEmployeeItem: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    roleText: {
        marginLeft: 5
    },
    availabilityText: {
        width: '100%',
        fontSize: 12,
        color: '#555',
        marginTop: 4,
        marginLeft: 10
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
    selectedDay: {
        backgroundColor: '#e8f5e9',
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
    gridHeaderText: {
        fontWeight: 'bold',
    },
    shiftContainer: { 
        width: '30%',
        alignSelf: 'flex-start',
        marginLeft: 30,
        padding: 10, 
        backgroundColor: '#e8f5e9' 
    },
    sectionTitle: { 
        fontSize: 20, 
        marginBottom: 10 
    },
    inputRow: { 
        width: '100%',
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'red'
    },
    input: { 
        minWidth: '35%',
        borderWidth: 1, 
        padding: 5, 
        marginRight: 10, 
    },
    draggable: {
        marginBottom: 10,
        borderRadius: 8,
    },
    gradient: {
        padding: 15,
        borderRadius: 8,
        minHeight: 65, 
    },
    expandedGradient: {
        // Increased height for gradient when availability is displayed
        height: 80,
    },
    bottomShiftContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 10,
    },
    draggableShifts: {  
        width: '40%',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
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