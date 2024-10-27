import React, { useState, useRef } from 'react';
import { Image, Dimensions, View, Button, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated, PanResponder, FlatList } from 'react-native';
import NavBar from '../../components/NavBar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDateRangeText, changeDate, getWeekDates, getDayView } from '../../components/useCalendar';
import ScheduleGrid from '../../components/ScheduleGrid';

const { width, height } = Dimensions.get('window');

const SchedulePage = () => {

    const [view, setView] = useState('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const dates = view === 'week' ? getWeekDates(currentDate) : getDayView(currentDate);

    const [employees, setEmployees] = useState([
        { id: '1', name: 'Alonzo Carter', role: 'Manager', assigned: false, pan: new Animated.ValueXY() },
        { id: '2', name: 'Emily Song', role: 'Manager', assigned: false, pan: new Animated.ValueXY() },
        { id: '3', name: 'Jonathan Richardson', role: 'Employee', assigned: false, pan: new Animated.ValueXY() },
    ]);

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
    const handleDrop = (gesture, item, type) => {
        const { moveX, moveY } = gesture;
        if (scheduleGridRef.current) {
            scheduleGridRef.current.handleDrop(moveX, moveY, item, type);
        }
    };

    const onDrop = (cellId, item, type) => {
        if (type === 'employee') {
            setEmployeeAssignments((prev) => ({
                ...prev,
                [cellId]: item.name,
            }));
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.id === item.id ? { ...emp, assigned: true } : emp
                )
            );
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
                                </View>
                                    {employees.filter(emp => !emp.assigned).map((employee) => {
                                        const panResponder = PanResponder.create({
                                            onStartShouldSetPanResponder: () => true,
                                            onPanResponderMove: Animated.event(
                                                [null, { dx: employee.pan.x, dy: employee.pan.y }],
                                                { useNativeDriver: false }
                                            ),
                                            onPanResponderRelease: (e, gesture) => {
                                                handleDrop(gesture, employee, 'employee'); // Ensure type is 'employee'
                                                Animated.spring(employee.pan, {
                                                    toValue: { x: 0, y: 0 },
                                                    useNativeDriver: false,
                                                }).start();
                                            },
                                        });

                                        return (
                                            <Animated.View
                                                key={employee.id}
                                                {...panResponder.panHandlers}
                                                style={[employee.pan.getLayout(), styles.draggable]}
                                            >
                                                <View style={styles.topEmployeeItem}>
                                                    <Text>{employee.name}</Text>
                                                    <Text>Hrs: 0</Text>
                                                </View>

                                                <Text style = {styles.roleText}>{employee.role}</Text>
                                            </Animated.View>
                                        );
                                    })}
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
                                    style={styles.input}
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
                                    style={[shift.pan.getLayout(), styles.draggable, { backgroundColor: 'lightgreen' }]}
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
        borderColor: 'gray',
        borderWidth: 1,
        backgroundColor: '#fff',
        borderRadius: 5,
        zIndex: 9999,
        top: 25, 
        left: 0,
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
        flex: 2,
        flexDirection: 'column',
        alignSelf: 'stretch',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'red'
    },
    gridHeader: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    gridHeaderCell: {
        width: '14.29%',
        //flex: 1,
        //flexShrink: 1,
        //width: 'auto',
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#e7e7e7',
        borderRightWidth: 1,
        borderRightColor: '#ccc',
    },
    gridHeaderText: {
        fontWeight: 'bold',
    },
    shiftContainer: { 
        //flex: 0.5,
        alignSelf: 'flex-start',
        padding: 10, 
        backgroundColor: '#e8f5e9' 
    },
    sectionTitle: { 
        fontSize: 20, 
        marginBottom: 10 
    },
    inputRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    input: { 
        borderWidth: 1, 
        padding: 5, 
        marginRight: 10, 
    },
    draggable: {
        width: '100%',
        height: 60,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10
    },
    bottomShiftContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 10,
    },
    input: {
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