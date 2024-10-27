// import React, { useState, useRef } from 'react';
// import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';

// const TestPage = () => {
//     const [employees, setEmployees] = useState([
//         { id: '1', name: 'Alonzo Carter', role: 'Manager' },
//         { id: '2', name: 'Emily Song', role: 'Manager' },
//         { id: '3', name: 'Jonathan Richardson', role: 'Employee' },
//     ]);

//     const gridCells = useRef({});
//     const [gridAssignments, setGridAssignments] = useState({});

//     const pan = useRef(new Animated.ValueXY()).current;

//     const panResponder = useRef(
//         PanResponder.create({
//             onStartShouldSetPanResponder: () => true,
//             onPanResponderMove: Animated.event(
//                 [null, { dx: pan.x, dy: pan.y }],
//                 { useNativeDriver: false }
//             ),
//             onPanResponderRelease: (e, gesture) => {
//                 handleDrop(gesture);
//                 Animated.spring(pan, {
//                     toValue: { x: 0, y: 0 },
//                     useNativeDriver: false,
//                 }).start();
//             },
//         })
//     ).current;

//     const handleDrop = (gesture) => {
//         const { moveX, moveY } = gesture;

//         // Check if the gesture is within any of the grid cell boundaries
//         Object.keys(gridCells.current).forEach((cellId) => {
//             const { x, y, width, height } = gridCells.current[cellId];
//             if (
//                 moveX > x &&
//                 moveX < x + width &&
//                 moveY > y &&
//                 moveY < y + height
//             ) {
//                 // Update the state to assign this employee to the cell
//                 setGridAssignments((prev) => ({
//                     ...prev,
//                     [cellId]: 'Dropped Employee',
//                 }));
//             }
//         });
//     };

//     // Measure each cell and save its coordinates
//     const measureCell = (cellId, ref) => {
//         ref.measureInWindow((x, y, width, height) => {
//             gridCells.current[cellId] = { x, y, width, height };
//         });
//     };

//     return (
//         <View style={styles.container}>
//             <View style={styles.employeeContainer}>
//                 <Animated.View
//                     {...panResponder.panHandlers}
//                     style={[pan.getLayout(), styles.draggable]}
//                 >
//                     <Text style={styles.text}>Drag Me</Text>
//                 </Animated.View>
//             </View>

//             <View style={styles.gridContainer}>
//                 {[...Array(4)].map((_, rowIndex) => (
//                     <View key={rowIndex} style={styles.gridRow}>
//                         {[...Array(4)].map((_, colIndex) => {
//                             const cellId = `${rowIndex}-${colIndex}`;
//                             return (
//                                 <View
//                                     key={colIndex}
//                                     style={styles.gridCell}
//                                     ref={(ref) => {
//                                         if (ref) {
//                                             measureCell(cellId, ref);
//                                         }
//                                     }}
//                                 >
//                                     <Text style={styles.cellText}>
//                                         {gridAssignments[cellId] || 'Drop Here'}
//                                     </Text>
//                                 </View>
//                             );
//                         })}
//                     </View>
//                 ))}
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#fff', padding: 20, userSelect: 'none' },
//     employeeContainer: { marginBottom: 20 },
//     draggable: {
//         width: 100,
//         height: 100,
//         backgroundColor: 'skyblue',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     text: { color: '#fff' },
//     gridContainer: { flexDirection: 'column' },
//     gridRow: { flexDirection: 'row' },
//     gridCell: {
//         width: 80,
//         height: 80,
//         margin: 5,
//         backgroundColor: '#f0f0f0',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     cellText: { fontSize: 14 },
// });

// export default TestPage;

import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions, FlatList } from 'react-native';
import NavBar from '../../components/NavBar';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SchedulePage = () => {
    const [selectedDay, setSelectedDay] = useState(null);
    const [view, setView] = useState('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [titleOption, setTitleOption] = useState('All');
    const filterOptions = ["All", "Managers", "Employees"];

    const DEFAULT_ROW_COUNT = 6;
    const [rowCount, setRowCount] = useState(DEFAULT_ROW_COUNT);
    const [inputRowCount, setInputRowCount] = useState(String(rowCount));

    const [employees, setEmployees] = useState([
        { id: '1', name: 'Alonzo Carter', role: 'Manager' },
        { id: '2', name: 'Emily Song', role: 'Manager' }, 
        { id: '3', name: 'Jonathan Richardson', role: 'Employee' },
        { id: '4', name: 'Kenneth Park', role: 'Employee' },
        { id: '5', name: 'Riya Patel', role: 'Employee' },
        { id: '6', name: 'Stephanie Sanchez', role: 'Employee' },
    ]);

    // const [gridAssignments, setGridAssignments] = useState({});
    const gridAssignments = useRef({});
    const cellRefs = useRef({});

    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);


    const getDateRangeText = () => {
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

    // Function to change the current week or month
    const changeDate = (direction) => {
        const newDate = new Date(currentDate);
        if (view === 'week') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        } else if (view === 'day') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const getWeekDates = () => {
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

    const getDayView = () => {
        return [currentDate];
    };

    const dates = view === 'week' ? getWeekDates() : getDayView();

    // Handler to change day and fetch available employees
    const onDayPress = (day) => {
        setSelectedDay(day.dateString);
        // You can implement logic to fetch available employees for this day
    };

    const onGestureEvent = (event) => {
            // translateX.value = event.translationX;
            // translateY.value = event.translationY;
            dragX.value = event.absoluteX;
            dragY.value = event.absoluteY;
    };

    const onHandlerStateChange = (event, employee) => {
        if (event.nativeEvent.state === 5) { // End of gesture
            handleDrop(employee);
            dragX.value = withSpring(0);
            dragY.value = withSpring(0);
            // translateX.value = withSpring(0);
            // translateY.value = withSpring(0);
            // isDragging.value = false;
        }
        // } else if (event.nativeEvent.state === 2){
        //     isDragging.value = true;
        // }
    };

    const handleDrop = (employee) => {
        // Check if the drop occurred within any of the grid cells
        Object.keys(cellRefs.current).forEach((cellId) => {
            cellRefs.current[cellId].measure((x, y, width, height, pageX, pageY) => {
                if (
                    // dragX.value >= pageX &&
                    // dragX.value <= pageX + width &&
                    // dragY.value >= pageY &&
                    // dragY.value <= pageY + height
                    dragX.value + width / 2 >= pageX &&
                    dragX.value + width / 2 <= pageX + width &&
                    dragY.value + height / 2 >= pageY &&
                    dragY.value + height / 2 <= pageY + height
                    // translateX.value >= pageX &&
                    // translateX.value <= pageX + width &&
                    // translateY.value >= pageY &&
                    // translateY.value <= pageY + height
                ) {
                    runOnJS(assignEmployeeToCell)(employee, cellId);
                }
            });
        });
    };

    // Placeholder function to handle when an employee is dropped in a shift slot
    // const onDropEmployee = (employee, cellId) => {
    //     setGridAssignments((prev) => ({
    //         ...prev,
    //         [cellId]: employee.name,
    //     }));
    // };

    const assignEmployeeToCell = (employee, cellId) => {
        gridAssignments.current[cellId] = employee.name;
        setEmployees((prevEmployees) =>
            prevEmployees.map((emp) =>
                emp.id === employee.id ? { ...emp, assigned: true } : emp
            )
        );
    };

    const renderEmployee = ({ item }) => {
        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: dragX.value }, { translateY: dragY.value }],
            position: 'absolute',
        }));

        return (
            <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={(event) => onHandlerStateChange(event, item)}>
                <Animated.View style={[styles.employeeItem, animatedStyle]}>
                    <TouchableOpacity onPress={() => console.log(`Clicked on ${item.name}`)}>
                        <View style={styles.topEmployeeItem}>
                            <Text>{item.name}</Text>
                            <Text>Hrs: 0</Text>
                        </View>
                        <Text style = {styles.roleText}>{item.role}</Text>
                    </TouchableOpacity>   
                </Animated.View>
            </PanGestureHandler>
        );
    };

    // Function to render each employee
    // const renderEmployee = ({ item, drag }) => (
    //     <TouchableOpacity
    //     style={styles.employeeItem}
    //     onLongPress={drag} // Long press to drag
    //     >
    //         <View style={styles.topEmployeeItem}>
    //             <Text>{item.name}</Text>
    //             <Text>Hrs: 0</Text>
    //         </View>
        
    //         <Text style = {styles.roleText}>{item.role}</Text>
    //     </TouchableOpacity>
    // );

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

    return (
        <GestureHandlerRootView>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false} 
                showsHorizontalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <NavBar homeRoute={'Business'}/>

                    <Text style={styles.dashboardText}> Manage Schedule</Text>

                    <View style={styles.wholeScheduleContainer}>
                        <View style={styles.topContainer}>
                            <View style = {styles.calendarButtonsContainer}>
                                <TouchableOpacity style={[styles.calendarButton, , view === 'week' && styles.activeView]} onPress={() => setView('week')}>
                                    <Text style={styles.buttonText}>Week</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.calendarButton, , view === 'day' && styles.activeView]} onPress={() => setView('day')}>
                                    <Text style={styles.buttonText}>Day</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.dateText}>{getDateRangeText()}</Text>

                            <View style = {styles.arrowButtons}>
                                <TouchableOpacity style={styles.arrow} onPress={() => changeDate('prev')}>
                                    <Ionicons name="arrow-back-outline" size={15} color="black" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.arrow} onPress={() => changeDate('next')}>
                                    <Ionicons name="arrow-forward-outline" size={15} color="black" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.scheduleContainer}>
                            <View style={styles.employeeList}>
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
                                
                                <FlatList
                                    data={employees}
                                    renderItem={renderEmployee}
                                    keyExtractor={(item) => item.id}
                                />
                            </View>

                            {/* Placeholder for shifts */}
                            <View style={styles.shiftsContainer}>
                                
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

                                    {/* Render blank rows and cells for employee placement */}
                                    {[...Array(rowCount)].map((_, rowIndex) => (  // Adjust the number of rows as needed
                                        <View key={rowIndex} style={styles.gridRow}>
                                            {dates.map((_, colIndex) => {
                                                const cellId = `${rowIndex}-${colIndex}`; 

                                                return (
                                                    <View 
                                                        key={colIndex} 
                                                        style={styles.gridCell}
                                                        ref={(ref) => (cellRefs.current[cellId] = ref)}
                                                        // onLayout={() => {
                                                        //     // Capture cell position, if necessary for drop detection
                                                        // }}
                                                    >
                                                        <Text style={styles.gridCellText}>
                                                            {gridAssignments[cellId] || 'Drop Here'}
                                                        </Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    ))}
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
                        </View>
                    </View>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1, 
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'red'
    },
    dashboardText: {
        fontSize: 30,
        alignSelf: 'flex-start',
        marginVertical: 40,
        marginLeft: 30
    },
    wholeScheduleContainer: {
        maxWidth: '100%',
        minWidth: '60%',
        minHeight: '50%',
    },
    topContainer: {
        flexDirection: 'row',
        height: 80,
        width: 'auto',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        backgroundColor: 'white',
        // borderBottomWidth: 1,
        // borderBottomColor: '#ccc',
        borderWidth: 2,
        borderColor: 'purple'
      },
      scheduleContainer: {
        flexDirection: 'row',
        flex: 1,
        borderWidth: 2,
        borderColor: 'green'
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
    employeeTopContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 18,
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
    employeeList: {
        width: '30%',
        padding: 10,
        backgroundColor: '#f7f7f7',
        borderRightWidth: 1,
        borderRightColor: '#ccc',
    },
    title: {
        fontSize: 18,
        marginBottom: 10,
    },
    employeeItem: {
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 5,
        elevation: 2,
    },
    topEmployeeItem: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    roleText: {
        marginTop: 5,
        marginLeft: 5
    },
    shiftsContainer: {
        flex: 1,
        backgroundColor: '#fafafa',
        borderRadius: 5,
        borderWidth: 2,
        borderColor: 'orange'
    },
    gridContainer: {
        flexDirection: 'column',
        width: '100%',
    },
    gridHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    gridHeaderCell: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#e7e7e7',
        borderRightWidth: 1,
        borderRightColor: '#ccc',
    },
    gridHeaderText: {
        fontWeight: 'bold',
    },
    gridRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    gridCell: {
        flex: 1,
        minHeight: 70,
        padding: 10,
        borderRightWidth: 1,
        borderRightColor: '#ccc',
        backgroundColor: '#fff',
    },
    gridCellText: {
        textAlign: 'center',
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
});

export default SchedulePage;
