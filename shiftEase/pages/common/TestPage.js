import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Dimensions, View, Button, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated, PanResponder, FlatList } from 'react-native';
import NavBar from '../../components/NavBar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDateRangeText, changeDate, getWeekDates, getDayView } from '../../components/useCalendar';
import ScheduleGrid from '../../components/ScheduleGrid';
import { useSelector } from 'react-redux';
import { fetchEmployees } from '../../../backend/api/employeeApi';

const { width, height } = Dimensions.get('window');

const TestPage = () => {

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [titleOption, setTitleOption] = useState('All');
    const filterOptions = ["All", "Managers", "Employees"];

    const [shiftTimes, setShiftTimes] = useState([]);
    const [newShiftStart, setNewShiftStart] = useState('');
    const [newShiftEnd, setNewShiftEnd] = useState('');
    const [employeeAssignments, setEmployeeAssignments] = useState({});
    const [shiftAssignments, setShiftAssignments] = useState({});
    const scheduleGridRef = useRef(null);

    const DEFAULT_ROW_COUNT = 6;
    const [rowCount, setRowCount] = useState(DEFAULT_ROW_COUNT);
    const [inputRowCount, setInputRowCount] = useState(String(rowCount));

    // Fetch employees from the backend API
    const getEmployees = useCallback(async () => {
        console.log("Trying to fetch employees");
        setLoading(true);
        setError(null);
        try {
        const data = await fetchEmployees(businessId); // Fetch employees based on the businessId

        // Add `pan` property with Animated.ValueXY for drag functionality
        const employeesWithPan = data.map((employee) => ({
            ...employee,
            pan: new Animated.ValueXY(),
        }));

        setEmployees(employeesWithPan);
        console.log("Employees set in state:", employeesWithPan);
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

    // Loading or error handling can be added here as needed
    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>{error}</Text>;

    const handleSelectTitle = (selectedTitle) => {
        setTitleOption(selectedTitle);
        setIsDropdownVisible(false);
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
        if (type === 'employee') {
            setEmployeeAssignments((prev) => ({
                ...prev,
                [cellId]: item,
            }));
        } else if (type === 'shift') {
            setShiftAssignments((prev) => ({
                ...prev,
                [cellId]: item.time,
            }));
            setShiftTimes((prev) =>
                prev.map((shift) =>
                    shift.id === item.id ? { ...shift, assigned: true } : shift
                )
            );
        }
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
                        <View style={styles.topContainer}>
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
                        </View>
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
                                    {/*{employees.filter(emp => !emp.assigned).map((employee) => {*/}
                                    {employees.map((employee) => (
                                        <AnimatedEmployeeItem 
                                            key={employee.emp_id} 
                                            employee={employee}
                                            handleDrop={handleDrop}
                                        />
                                    ))}
                            </View>
                            
                            {/* Grid for the shifts */}
                            <View style={styles.gridContainer}>
                                {/* Render days of the week as headers */}
                                <View style={styles.gridHeader}>
                                    {dates.map((date, index) => (
                                        <TouchableOpacity key={index} style={styles.gridHeaderCell}>
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
  
    return (
      <Animated.View {...panResponder.panHandlers} style={[employee.pan.getLayout(), styles.draggable]}>
        <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style = {styles.gradient}>
            <View style={styles.topEmployeeItem}>
                <Text>{`${employee.f_name} ${employee.l_name}`}</Text>
                <Text>Hrs: 0</Text>
            </View>
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
        userSelect: 'none'
    },
    dashboardContainer: {
        flexGrow: 1,
        width: '100%',
        alignItems: 'center',
        marginBottom: 50,
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
        borderWidth: 2,
        borderColor: 'orange'
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
        minHeight: '70%',
        alignSelf: 'center',
        minHeight: '50%',
        borderWidth: 2,
        borderColor: 'green'
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
        height: '100%',
        padding: 10,
        backgroundColor: '#f7f7f7',
        borderRightWidth: 1,
        borderRightColor: '#ccc',
        marginBottom: 20,
        // borderWidth: 2,
        // borderColor: 'purple'
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
    gridContainer: {
        position: 'relative',
        flex: 2,
        flexDirection: 'column',
        alignSelf: 'stretch',
        overflow: 'hidden',
        zIndex: 1
        // borderWidth: 2,
        // borderColor: 'red'
    },
    gridHeader: {
        flex:1,
        flexDirection: 'row',
        //width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        position: 'relative',
        zIndex: 1
    },
    gridHeaderCell: {
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
        //justifyContent: 'space-evenly',
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
        position: 'relative',
        width: '100%',
        height: 60,
        justifyContent: 'center',
        marginBottom: 10,
        zIndex: 10,
    },
    gradient: {
        width: '100%',
        height: 60,
        justifyContent: 'center',
        padding: 10,
        borderRadius: 10,
        //zIndex: 10,
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

export default TestPage;