import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Image, View, Text, Button, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { getWeekDates, getDayView, getStartOfWeek } from '../../components/schedule_components/useCalendar';
import NavBar from '../../components/NavBar';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderControls from '../../components/schedule_components/HeaderControls';
import { fetchScheduleAPI, offerShiftAPI, fetchEmployeeShiftOffersAPI, cancelShiftOfferAPI } from '../../../backend/api/scheduleApi';
import { formatTime, formatDate } from '../../components/schedule_components/scheduleUtils';
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
    const [shiftsData, setShiftsData] = useState([]);
    const [scheduleLoaded, setScheduleLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [totalScheduledHours, setTotalScheduledHours] = useState(0);

    // State for calendar view (week or day)s
    const [view, setView] = useState('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Calculate week start date from the current date
    const weekStartDate = useMemo(() => getStartOfWeek(currentDate), [currentDate]);

    // State for managing shift details popup
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [offeredShifts, setOfferedShifts] = useState([]);
    const [activeFilter, setActiveFilter] = useState("Active Shift Offers");

    const filteredOfferedShifts = useMemo(() => {
        return offeredShifts
            .map((shift) => {
                const employee = scheduledEmployees.find(
                    (emp) => `${emp.f_name} ${emp.l_name}` === shift.employeeName
                );
                if (employee) {
                    return { ...shift, employeeId: employee.emp_id };
                }
                return shift;
            })
            .filter((shift) => shift.status.toLowerCase() !== 'cancelled');
    }, [offeredShifts, scheduledEmployees]);

    
    const dates = useMemo(() => {
        return view === 'week' ? getWeekDates(currentDate) : getDayView(currentDate);
    }, [view, currentDate]);

    // Get employees and shifts using useEmployeeData hook
    const { employees, setEmployees, setEmployeeAssignments, shiftAssignments, setShiftAssignments } = useEmployeeData(businessId);
    console.log('Data from useEmployeeData: ');
    console.log('Employees: ', employees);
    console.log('Shift Assignments: ', shiftAssignments);

    // Clear previous schedule data whenever `weekStartDate` changes
    useEffect(() => {
        setScheduleId(null);
        setScheduledEmployees([]);
        setShiftsData([]);
        setEmployeeAssignments({});
        setShiftAssignments({});
        setScheduleLoaded(false);
        setTotalScheduledHours(0);
    }, [weekStartDate]);

    // Fetch and load schedule and shifts for the selected week
    useEffect(() => {
        if (employees.length > 0) {
            const loadSchedule = async () => {
                // Check if employees are loaded before running the function
                if (!employees || employees.length === 0) {
                    console.log("Employees not yet loaded, skipping schedule load.");
                    return;
                }

                setIsLoading(true);
                
                // Format the weekStartDate to 'YYYY-MM-DD' for compatibility
                const formattedWeekStartDate = weekStartDate.toISOString().slice(0, 10); // 'YYYY-MM-DD'
                console.log("Formatted Week Start Date:", formattedWeekStartDate);

                console.log("Business ID:", businessId, "Week Start Date:", formattedWeekStartDate);

                try {
                    console.log("Trying to loadSchedule");

                    const existingSchedule = await fetchScheduleAPI(businessId, formattedWeekStartDate);
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

                        let userTotalHours = 0;

                        existingSchedule.shifts.forEach((shift) => {
                            const shiftDate = shift.date.slice(0, 10); // Format to YYYY-MM-DD
                            const dateIndex = dates.findIndex((date) => date.toISOString().slice(0, 10) === shiftDate);
                        
                            if (dateIndex !== -1) {
                                const cellId = `${shift.employeeId}-${dateIndex}`;
                        
                                // Initialize an array if no shifts are stored for this cell yet
                                if (!loadedShiftAssignments[cellId]) {
                                    loadedShiftAssignments[cellId] = { shifts: [] };
                                }
                        
                                // Append the current shift
                                loadedShiftAssignments[cellId].shifts.push({
                                    time: `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`,
                                    shiftId: shift.shiftId,
                                    startTime: shift.startTime,
                                });

                                // Sort the shifts by start time
                                loadedShiftAssignments[cellId].shifts.sort((a, b) => {
                                    return a.startTime.localeCompare(b.startTime);
                                });
                        
                                // Calculate shift duration and add to total for the logged-in employee
                                if (shift.employeeId === loggedInEmployeeId) {
                                    const shiftDuration = calculateShiftDuration(shift.startTime, shift.endTime);
                                    userTotalHours += shiftDuration;
                                }
                            }
                        });

                        setEmployeeAssignments(loadedEmployeeAssignments);
                        setShiftAssignments(loadedShiftAssignments);
                        setTotalScheduledHours(userTotalHours);

                        console.log('Employee Assignments: ', loadedEmployeeAssignments);
                        console.log('Shift Assignments: ', loadedShiftAssignments);
                        
                        setScheduleLoaded(true);
                    } else {
                        setScheduleId(null); // Clear schedule ID if no schedule found
                    }
                } catch (error) {
                    console.error("Error loading schedule:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadSchedule();
        }
    }, [businessId, weekStartDate, loggedInEmployeeId, employees, ]); //dates,  setEmployeeAssignments, setShiftAssignments, 
    
    // Helper function to calculate shift duration in hours
    const calculateShiftDuration = (startTime, endTime) => {
        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        const duration = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
        return duration > 0 ? duration : 0;
    };

    // Function to handle cell click for logged-in employee
    const handleShiftClick = (shiftData, cellId) => {
        console.log("Shift Clicked:", shiftData);
        setSelectedShift({ ...shiftData, cellId });
        setPopupVisible(true);
    };

    useEffect(() => {
        const fetchOfferedShifts = async () => {
            try {
                const response = await fetchEmployeeShiftOffersAPI(loggedInEmployeeId);
                setOfferedShifts(response || []);
            } catch (error) {
                console.error('Error fetching offered shifts:', error);
            }
        };

        if (loggedInEmployeeId) {
            fetchOfferedShifts();
        }
    }, [loggedInEmployeeId]);

    useEffect(() => {
        console.log("Offered Shifts:", offeredShifts);
    }, [offeredShifts]);

    useEffect(() => {
        console.log('Updated Shift Assignments:', shiftAssignments);
    }, [shiftAssignments]);

    // Function to handle closing the popup
    const closePopup = () => {
        setPopupVisible(false);
        setSelectedShift(null);
    };

    useEffect(() => {
        if (filteredOfferedShifts.length > 0) {
            setShiftAssignments((prevAssignments) => {
                const updatedAssignments = { ...prevAssignments };
    
                filteredOfferedShifts.forEach((shift) => {
                    // Find the correct cellId for the offered shift
                    const shiftDate = shift.date.slice(0, 10); // Format to 'YYYY-MM-DD'
                    const dateIndex = dates.findIndex((date) => date.toISOString().slice(0, 10) === shiftDate);
    
                    console.log("Processing Shift Offer:", shift);
                    console.log("Matching Date Index:", dateIndex);

                    if (dateIndex !== -1 && shift.employeeId) {
                        const cellId = `${shift.employeeId}-${dateIndex}`;
                        console.log("Generated Cell ID:", cellId);

                        if (!updatedAssignments[cellId]) {
                            updatedAssignments[cellId] = {}; // Initialize if not already present
                        }
    
                        updatedAssignments[cellId] = {
                            ...updatedAssignments[cellId],
                            isOffered: shift.status.toLowerCase() === 'offered',
                        };
                    }
                });
                console.log("Updated Shift Assignments after Offered Shifts Sync:", updatedAssignments);
                return updatedAssignments;
            });
        }
    }, [filteredOfferedShifts, dates]);

    
    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false} 
            showsHorizontalScrollIndicator={false}
        >
            <View style={styles.container}>
                <NavBar homeRoute={'Employee'} showLogout={false}/>

                <Text style={styles.dashboardText}> View Schedule</Text>
                <View style={styles.topContainer}>
                        <Text style={styles.topText}>Scheduled Hours: {totalScheduledHours}</Text>
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
                        {scheduleLoaded && !isLoading ? (
                            <View style={styles.scheduleContainer}> 
                                <View style={styles.gridHeader}>
                                    <View style={[
                                        styles.employeeCell,
                                            {
                                                borderLeftWidth: 1, 
                                                borderLeftColor: '#ccc', 
                                                backgroundColor: '#e7e7e7', 
                                            },
                                        ]}><Text>Employee</Text>
                                    </View>
                                    {dates.map((date, index) => (
                                        <View key={index} style={styles.headerCell}>
                                            <Text>{date.toDateString()}</Text>
                                        </View>
                                    ))}
                                </View>

                                {scheduledEmployees.map((employee) => (
                                    <View 
                                        key={employee.emp_id} 
                                        style={[
                                            styles.gridRow, 
                                            employee.emp_id === loggedInEmployeeId && styles.highlightRow
                                        ]}>
                                        <View style={styles.employeeCell}>
                                            <Text>{employee.f_name} {employee.l_name}</Text>
                                        </View>
                                        {dates.map((date, colIndex) => {
                                            const cellId = `${employee.emp_id}-${colIndex}`;
                                            const shiftData = shiftAssignments[cellId]; 
                                            console.log(`Cell ID: ${cellId}`, "Shift Data:", shiftData);

                                            // Join all shift times with line breaks
                                            const shiftTimes = shiftData?.shifts?.map((shift) => shift.time).join('\n');
                                            console.log("Shift times: ", shiftTimes);

                                            // Calculate if the shift date is in the past
                                            const isPast = new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
                                            
                                            // Determine if this row belongs to the logged-in user
                                            const isLoggedInUser = employee.emp_id === loggedInEmployeeId;

                                            return (
                                                <TouchableOpacity
                                                    key={colIndex}
                                                    style={[
                                                        styles.scheduleCell,
                                                        isLoggedInUser && styles.clickableCell,
                                                        isLoggedInUser && isPast && styles.disabledCell,
                                                    ]}
                                                    disabled={isLoggedInUser && isPast}
                                                    onPress={() => 
                                                        !isPast &&
                                                        isLoggedInUser && 
                                                        shiftData &&
                                                        handleShiftClick({
                                                            //shiftId: shiftData.shiftId,
                                                            shifts: shiftData.shifts,
                                                            date: date.toDateString(),
                                                            time: shiftData.shifts?.map((shift) => shift.time).join('\n'),
                                                            employee: `${employee.f_name} ${employee.l_name}`,
                                                        }, cellId)
                                                    }
                                                >
                                                    <Text> {shiftTimes || 'Off'}</Text>

                                                    {/* Display "Offered" below the time if the shift is offered */}
                                                    {shiftData?.isOffered && <Text style={styles.offeredText}>Offered</Text>}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        ) : !isLoading && (
                            <View style={styles.noScheduleContainer}>
                                <Text style={styles.noScheduleText}>No schedule yet</Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center', marginBottom: 20}}>
                        <TouchableOpacity 
                            style={[styles.inactiveButton, activeFilter === "Inactive Shift Offers" && styles.activeButton]}
                            onPress={() => setActiveFilter("Inactive Shift Offers")}
                        >
                            <Text style={styles.buttonText}>Inactive Shift Offers</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.activeShiftButton, activeFilter === "Active Shift Offers" && styles.activeButton]}
                            onPress={() => setActiveFilter("Active Shift Offers")}
                        >
                            <Text style={styles.buttonText}>Active Shift Offers</Text>
                        </TouchableOpacity>
                    </View>

                    {activeFilter === "Active Shift Offers" && (
                        <View style={styles.wholeOfferedShiftsContainer}>
                            <Text style={styles.sectionHeader}>Active Shift Offers</Text>
                            <View style={styles.offeredShiftsContainer}>
                                {filteredOfferedShifts.filter((shift) => {
                                    const shiftDate = new Date(shift.date);
                                    return (
                                        shiftDate >= new Date().setHours(0, 0, 0, 0) && // Only future or today’s shifts
                                        !shift.acceptedEmpId // Exclude accepted shifts
                                    );
                                }).length > 0 ? (
                                    filteredOfferedShifts
                                        .filter((shift) => {
                                            const shiftDate = new Date(shift.date);
                                            return (
                                                shiftDate >= new Date().setHours(0, 0, 0, 0) && // Only future or today’s shifts
                                                !shift.acceptedEmpId // Exclude accepted shifts
                                            );
                                        })
                                        .map((shift) => (
                                            <LinearGradient
                                                colors={['#E7E7E7', '#A7CAD8']}
                                                style={styles.offeredShiftItem}
                                                key={shift.shiftOfferId}
                                            >
                                                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                                                    <Text>
                                                        Status: <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{shift.status.toUpperCase()}</Text>
                                                    </Text>

                                                    <Text>Date: {new Date(shift.date).toLocaleDateString()}</Text>

                                                    <Text>
                                                        Time: {shift.startTime && shift.endTime ? `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}` : 'Invalid time'}
                                                    </Text>

                                                    <Text>Offered At: {shift.offeredAt ? formatDate(shift.offeredAt) : 'N/A'}</Text>

                                                    <TouchableOpacity
                                                        style={styles.cancelShiftBtn}
                                                        onPress={async () => {
                                                            try {
                                                                const result = await cancelShiftOfferAPI(shift.shiftId, loggedInEmployeeId);
                                                                console.log('Shift offer cancelled:', result);
                                                                alert('Shift offer cancelled successfully!');
                                                                setOfferedShifts((prev) =>
                                                                    prev.filter((offeredShift) => offeredShift.shiftId !== shift.shiftId)
                                                                );
                                                            } catch (error) {
                                                                console.error('Error cancelling shift offer:', error);
                                                                alert(`Failed to cancel shift offer: ${error.message}`);
                                                            }
                                                        }}
                                                    >
                                                        <Text style={{ color: '#FFFFFF', fontSize: 15 }}>Cancel Offer</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </LinearGradient>
                                        ))
                                ) : (
                                    <Text style={styles.noOffersText}>
                                        You don't have any active shift offers.
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}

                    {activeFilter === "Inactive Shift Offers" && (
                        <View style={styles.wholeOfferedShiftsContainer}>
                            <Text style={styles.sectionHeader}>Inactive Shift Offers</Text>
                            <ScrollView horizontal={true} contentContainerStyle={{flex: 1}}>
                                <View style={styles.offeredShiftsContainer}>
                                    {filteredOfferedShifts.filter((shift) => {
                                        const shiftDate = new Date(shift.date);
                                        return (
                                            shiftDate < new Date().setHours(0, 0, 0, 0) || // Include past shifts
                                            shift.acceptedEmpId // Include accepted shifts even if in the future
                                        );
                                    }).slice(0, 10).length > 0 ? (
                                        filteredOfferedShifts
                                            .filter((shift) => {
                                                const shiftDate = new Date(shift.date);
                                                return (
                                                    shiftDate < new Date().setHours(0, 0, 0, 0) || // Include past shifts
                                                    shift.acceptedEmpId // Include accepted shifts even if in the future
                                                );
                                            })
                                            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort from most recent to oldest
                                            .slice(0, 10) // Limit to the most recent 10
                                            .map((shift) => (
                                                <LinearGradient
                                                    colors={['#F5F5F5', '#D3D3D3']}
                                                    style={styles.offeredShiftItem}
                                                    key={shift.shiftOfferId}
                                                >
                                                    {console.log("Shift accepted_emp_id:", shift.acceptedEmpId)}
                                                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                                                        {shift.acceptedEmpId? (
                                                            <Text style={{ fontStyle: 'italic', color: 'green', fontWeight: 'bold' }}>
                                                                Accepted
                                                            </Text>
                                                        ) : (
                                                            <Text style={{ fontStyle: 'italic', color: 'red', fontWeight: 'bold' }}>
                                                                Not accepted
                                                            </Text>
                                                        )}
                                                        
                                                        <Text style={{ textDecorationLine: shift.accepted_emp_id ? 'none' : 'line-through' }}>
                                                            Status: <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{shift.status.toUpperCase()}</Text>
                                                        </Text>
                                                        
                                                        <Text>Date: {new Date(shift.date).toLocaleDateString()}</Text>

                                                        <Text>
                                                            Time: {shift.startTime && shift.endTime ? `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}` : 'Invalid time'}
                                                        </Text>

                                                        <Text>Offered At: {shift.offeredAt ? formatDate(shift.offeredAt) : 'N/A'}</Text>
                                                    </View>
                                                </LinearGradient>
                                            ))
                                    ) : (
                                        <Text style={styles.noOffersText}>
                                            You don't have any inactive shift offers.
                                        </Text>
                                    )}
                                </View>
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Bottom Bar with Logo */}
                <LinearGradient 
                    colors={['#E7E7E7', '#9DCDCD']} 
                    style={styles.bottomBarContainer}
                >
                    <Image
                        resizeMode="contain"
                        source={require('../../assets/images/logo1.png')}
                        style={styles.desktopLogo}
                    />
                </LinearGradient>

                {/* Shift Details Popup */}
                <Modal
                    visible={popupVisible}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.topShiftDetailsContainer}>
                                <Text style={styles.modalHeader}>Shift Details:</Text>
                                <TouchableOpacity onPress={closePopup}>
                                    <Image
                                        resizeMode="contain"
                                        source={require('../../assets/images/x_icon.png')}
                                        style={styles.cancelPhoto}
                                    />
                                </TouchableOpacity>
                            </View>

                            {selectedShift?.shifts?.length > 0 ? (
                                <View style={styles.shiftRowContainer}>
                                    {selectedShift.shifts.map((shift, index) => (
                                        <View key={index} style={styles.shiftColumn}>
                                            <Text>Employee: {selectedShift.employee}</Text>
                                            <Text>Date: {selectedShift.date}</Text>
                                            <Text>Time: {shift.time}</Text>
                                            <View style={styles.buttonContainer}>
                                                <TouchableOpacity
                                                    style={styles.button}
                                                    onPress={async () => {
                                                        console.log("Selected Shift:", shift); // Debugging log
                                                        console.log("Logged In Employee ID:", loggedInEmployeeId); // Debugging log
                                                        try {
                                                            const result = await offerShiftAPI(shift.shiftId, loggedInEmployeeId);
                                                            console.log("Shift offer result:", result);
                                                            setShiftAssignments((prev) => ({
                                                                ...prev,
                                                                [selectedShift.cellId]: {
                                                                    ...prev[selectedShift.cellId],
                                                                    isOffered: true,
                                                                },
                                                            }));
                                                            alert("Shift offered successfully!");
                                                            closePopup(); // Close the popup after successful action
                                                        } catch (error) {
                                                            console.error("Error offering shift:", error);
                                                            alert(`Failed to offer shift: ${error.message}`);
                                                        }
                                                    }}
                                                >
                                                    <Text style={styles.buttonText}>Offer Shift</Text>
                                                </TouchableOpacity>
                                                {/* <TouchableOpacity
                                                    style={[styles.button, { marginLeft: 10 }]}
                                                    onPress={() => console.log("Swap Shift")}
                                                >
                                                    <Text style={styles.buttonText}>Swap Shift</Text>
                                                </TouchableOpacity> */}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text>No shift data available.</Text>
                            )}
                        </View>
                    </View>
                </Modal>
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
    topContainer: {
        flexDirection: 'row',
        width: '95%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: 10,
    },
    topText: {
        fontSize: 18
    },
    dashboardContainer: {
        flexGrow: 1,
        width: '100%',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingBottom: 70
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
    },
    gridHeader: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
    },
    headerCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        backgroundColor: '#e7e7e7',
        borderColor: '#ccc',
    },
    employeeCell: {
        width: 140,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderColor: '#ccc',
    },
    gridRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        height: 50,
    },
    scheduleCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        minHeight: 50,
        borderRightWidth: 1,
        borderColor: '#ccc',
    },
    highlightRow: { 
        backgroundColor: '#e0f7fa' 
    },
    disabledCell: {
        backgroundColor: '#e0e0e0', 
        opacity: 0.5, 
    },
    noScheduleContainer: {
        width: '100%',
        height: '100%',
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    noScheduleText: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
    },
    offeredText: {
        fontSize: 12,
        color: 'green',
        fontWeight: 'bold',
        marginTop: 2,
    },
    inactiveButton: {
        width: 150,
        backgroundColor: '#A9C9D9',
        borderTopLeftRadius: 10,    
        borderBottomLeftRadius: 10,
        borderRightWidth: 1,        
        borderRightColor: 'grey',
        padding: 7,
        marginTop: 15,
        alignItems: 'center',
    },
    activeShiftButton: {
        width: 150,
        backgroundColor: '#A9C9D9',
        borderTopRightRadius: 10,    
        borderBottomRightRadius: 10,
        padding: 7,
        marginTop: 15,
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: '#7FA2B9', 
    },
    wholeOfferedShiftsContainer: {
        width: '95%',
        height: '35%',
        marginBottom: 70,
    },
    offeredShiftsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: '90%',
        paddingHorizontal: 10,
        alignItems: 'stretch',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    offeredShiftItem: {
        width: '20%',
        height: '100%',
        flexDirection: 'column',
        padding: 10,
        marginRight: 15,
        borderRadius: 5,
    },
    cancelShiftBtn: {
        width: 120,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        padding: 10,
        borderRadius: 30,
        backgroundColor: 'black'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    topShiftDetailsContainer: {
        flexDirection: 'row', 
        width: '100%', 
        justifyContent: 'space-between', 
        alignItems: 'baseline',
    },
    cancelPhoto: {
        width: 20,
        height: 20,
    },
    modalContent: {
        minWidth: '25%',
        maxWidth: '30%',
        height: '30%',
        backgroundColor: 'white',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 10,
    },
    modalHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    shiftRowContainer: {
        flexDirection: 'row',
        height: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    
    shiftColumn: {
        width: '50%', 
        height: '90%',
        padding: 10,
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 50,
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        alignSelf: 'flex-end',   
        marginVertical: 10,
    },
    button: {
        width: 100,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 30,
        backgroundColor: 'lightblue'
    },
    noOffersText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
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

export default ViewSchedulePage;  