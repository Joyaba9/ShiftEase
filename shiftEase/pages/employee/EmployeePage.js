import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, Image, View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import NavBar from '../../components/NavBar';
import { LinearGradient } from 'expo-linear-gradient';
import CurrentUser from '../../../backend/CurrentUser';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchEmployeeAvailability } from '../../../backend/api/employeeApi';
import { fetchScheduleAPI, fetchOpenShiftOffers, acceptShiftOfferAPI } from '../../../backend/api/scheduleApi';
import { getStartOfWeek } from '../../components/schedule_components/useCalendar';
import { calculateHoursDifference, formatTime, formatDate } from '../../components/schedule_components/scheduleUtils';
import SidebarButton from '../../components/SidebarButton';
import ShiftCard from '../../components/ShiftCard';
import EmployeePageMobile from './EmployeePageMobile';
import AddEmpModal from '../business/AddEmpModal';
import AnnouncementsModal from '../business/AnnouncementsModal';

const { width } = Dimensions.get('window');

const EmployeePage = () => {
    const isMobile = width < 768; 
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [pulledGeneralAnnouncement, setPulledGeneralAnnouncement] = useState([]);
    const [openAddForm, setOpenAddForm] = useState(false);
    const [employeeShifts, setEmployeeShifts] = useState([]);

    // Retrieve the logged-in user from Redux store
    const loggedInUser = useSelector((state) => state.user.loggedInUser);
    console.log('Logged in user:', loggedInUser);

    const userInfo = CurrentUser.getUserInfo();
    if (userInfo) {
        console.log('Current User:', userInfo);
        console.log('UID:', CurrentUser.getUserUID());
        console.log('Email:', CurrentUser.getUserEmail());
    } else {
        console.log('No user logged in');
    }

    useEffect(() => {
        if (!loggedInUser) {
            console.log("No logged-in user, redirecting to login page...");
            navigation.replace('Login');
        }
    }, [loggedInUser, navigation]);

    const employee = loggedInUser ? loggedInUser.employee : null;

    // State to control the visibility of the announcements modal
    const [announcementsVisible, setAnnouncementsVisible] = useState(false);
    const [addEmpVisible, setAddEmpVisible] = useState(false);

    // Pulls the latest general announcement to be displayed in announcement card
    const fetchLatestGeneralAnnouncements = async () => {
        try {
            const response = await fetch(`http://localhost:5050/api/announcements/general/latest/${loggedInUser.employee.business_id}`);
            if (response.ok) {
                const data = await response.json();
                console.log("Latest General Announcement Data:", data);
    
                // Check if data is null or an object
                if (data) {
                    // Transform data to expected format (if necessary)
                    const transformedData = {
                        id: data.id,
                        Title: data.title || 'No Title',
                        Content: data.content || 'No Content'
                    };
    
                    setPulledGeneralAnnouncement([transformedData]); // Wrap the transformed data in an array for consistent state management
                } else {
                    console.log('No announcement found for the provided business ID.');
                    setPulledGeneralAnnouncement([]); // Set to empty array if no data found
                }
            } else {
                console.error('Failed to fetch general announcements');
                setPulledGeneralAnnouncement([]);
            }
        } catch (error) {
            console.error('Error fetching general announcements:', error);
            setPulledGeneralAnnouncement([]);
        }
    };

    useEffect(() => {
        fetchLatestGeneralAnnouncements();
    }, []);

    // State for upcoming shifts
    const [upcomingShift, setUpcomingShift] = useState(null);
    const [openShiftOffers, setOpenShiftOffers] = useState([]);
    const [employeeAvailability, setEmployeeAvailability] = useState([]);
    const [totalWeeklyHours, setTotalWeeklyHours] = useState(0);
    const [activeFilter, setActiveFilter] = useState("All Shifts");

    // Fetch upcoming shifts on component mount
    useEffect(() => {
        const fetchUpcomingShift = async () => {
            try {
                if (!loggedInUser || !employee?.emp_id || !employee?.business_id) {
                    console.error("Logged-in user or employee data is missing");
                    return;
                }

                // Fetch the current week's schedule ID
                const today = new Date();
                const weekStartDate = getStartOfWeek(today).toISOString().slice(0, 10); // Format to 'YYYY-MM-DD'
                const scheduleData = await fetchScheduleAPI(employee.business_id, weekStartDate);

                if (!scheduleData || !scheduleData.schedule) {
                    console.log("No schedule found for the current week.");
                    setUpcomingShift(null);
                    setTotalWeeklyHours(0);
                    return;
                }

                const scheduleId = scheduleData.schedule.schedule_id;
                const shifts = scheduleData.shifts;

                // Calculate total weekly hours for the logged-in employee
                let totalHours = 0;
                const loggedInEmployeeShifts = shifts.filter(shift => shift.employeeId === employee.emp_id);

                setEmployeeShifts(loggedInEmployeeShifts);
                console.log("Employee shifts before filtering: ", loggedInEmployeeShifts);

                loggedInEmployeeShifts.forEach((shift) => {
                    totalHours += calculateHoursDifference(shift.startTime, shift.endTime);
                });

                setTotalWeeklyHours(totalHours); // Set total weekly hours

                // Find the next upcoming shift
                const now = new Date();

                // Find the next upcoming shift
                const futureShifts = loggedInEmployeeShifts.filter((shift) => new Date(shift.date) >= now);
                futureShifts.sort((a, b) => new Date(a.date) - new Date(b.date));

                if (futureShifts.length > 0) {
                    const nextShift = futureShifts[0];
                    // Calculate scheduled hours using the provided function
                    const scheduledHours = calculateHoursDifference(nextShift.startTime, nextShift.endTime);

                    setUpcomingShift({
                        ...nextShift,
                        scheduledHours,
                    });
                } else {
                    setUpcomingShift(null);
                }
            } catch (error) {
                console.error("Error fetching upcoming shifts:", error);
            }
        };

        fetchUpcomingShift();
    }, [loggedInUser, employee]);

    useEffect(() => {
        const fetchAvailability = async () => {
            const empId = loggedInUser.employee.emp_id; // Get logged-in employee ID
        
            if (!empId) {
                console.error("No employee ID found for the logged-in user");
                return;
            }

            try {
                // Fetch employee availability
                const result = await fetchEmployeeAvailability(empId);
                if (result && result.availability) {
                    console.log("Fetched Availability:", result.availability);
                    setEmployeeAvailability(result.availability); // Update state
                } else {
                    console.warn("No availability data returned from API");
                    setEmployeeAvailability([]);
                }
            } catch (error) {
                console.error("Error fetching employee availability:", error);
            }
        };
    
        fetchAvailability();
    }, [loggedInUser]);

    useEffect(() => {
        console.log("Updated Employee Availability:", employeeAvailability);
    }, [employeeAvailability]);

    useEffect(() => {
        if (!loggedInUser || !loggedInUser.employee) return;

        const fetchOpenShifts = async () => {
            const { emp_id, business_id } = loggedInUser.employee;

            setIsLoading(true);
            try {
                const shifts = await fetchOpenShiftOffers(emp_id, business_id);

                // Filter out shifts offered by the logged-in user
                const filteredShifts = shifts.filter(shift => shift.offered_emp_id !== emp_id);
                setOpenShiftOffers(filteredShifts);
            } catch (error) {
                console.error("Error fetching open shift offers:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOpenShifts();
    }, [loggedInUser]);

    const filteredShifts = useMemo(() => {
        if (activeFilter === "With Availability") {
            console.log('In Filtered With Availability');

            return openShiftOffers.filter((shift) => {
                const shiftDayIndex = new Date(shift.date).getDay();
                const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                const shiftDayName = dayNames[shiftDayIndex];

                console.log('Shift day index: ', shiftDayIndex);
                console.log('Shift day name: ', shiftDayName);

                console.log("Employee Availability in Filter:", employeeAvailability);
    
                // Only consider shifts that are today or in the future
                const shiftDate = new Date(shift.date);
                if (shiftDate < today) {
                    console.log("Skipping past shift:", shift);
                    return false;
                }

                return employeeAvailability.some((entry) => {
                    const startDate = new Date(entry.start_date);
                    const endDate = new Date(entry.end_date);

                    console.log('Shift date with availability: ', shiftDate)
                    console.log('Shift start date: ', startDate)
                    console.log('Shift end date: ', endDate)
    
                    const isDayMatch = entry.day_of_week === shiftDayName;
                    const isDateWithinRange = shiftDate >= startDate && shiftDate <= endDate;
                    const isTimeMatch = shift.start_time >= entry.start_time && shift.end_time <= entry.end_time;
    
                    return isDayMatch && isDateWithinRange && isTimeMatch;
                });
            });
        }
        return openShiftOffers.filter((shift) => new Date(shift.date) >= today);
    }, [activeFilter, openShiftOffers, employeeAvailability]);

    // const handleAcceptShift = async (shiftId) => {
    //     console.log('Trying to accept shift', shiftId)
    //     try {
    //         if (!employee || !employee.emp_id) {
    //             console.error('Employee ID is missing');
    //             return;
    //         }
    
    //         // Call the API
    //         const result = await acceptShiftOfferAPI(shiftId, employee.emp_id);
    //         console.log('Shift accepted:', result);
    
    //         setOpenShiftOffers((prevOffers) => prevOffers.filter((offer) => offer.shift_id !== shiftId));
    
    //         // Show success message or take additional actions
    //         alert('Shift accepted successfully!');
    //     } catch (error) {
    //         console.error('Error accepting shift:', error);
    //         alert('Failed to accept the shift. Please try again.');
    //     }
    // };

    console.log("Employee shifts before handle accept shift: ", employeeShifts);
    const handleAcceptShift = async (shiftId, newShiftDate, newShiftStartTime, newShiftEndTime) => {
        console.log('Trying to accept shift', shiftId, formatDate(newShiftDate), newShiftStartTime, newShiftEndTime);
    
        try {
            if (!employee || !employee.emp_id) {
                console.error('Employee ID is missing');
                return;
            }
    
            const newStart = new Date(newShiftDate);
            const newEnd = new Date(newShiftDate);
            newStart.setHours(...newShiftStartTime.split(':'));
            newEnd.setHours(...newShiftEndTime.split(':'));
    
            const hasConflict = employeeShifts.some((shift) => {
                // Ensure the dates match for conflict detection
                if (formatDate(shift.date) !== formatDate(newShiftDate)) return false;
    
                const existingStart = new Date(shift.date);
                const existingEnd = new Date(shift.date);
                existingStart.setHours(...shift.startTime.split(':'));
                existingEnd.setHours(...shift.endTime.split(':'));
    
                console.log("Comparing Shifts:", {
                    existingStart,
                    existingEnd,
                    newStart,
                    newEnd,
                });
    
                return (
                    (newStart >= existingStart && newStart < existingEnd) || // New shift starts during an existing shift
                    (newEnd > existingStart && newEnd <= existingEnd) || // New shift ends during an existing shift
                    (newStart <= existingStart && newEnd >= existingEnd) // New shift fully overlaps an existing shift
                );
            });
    
            if (hasConflict) {
                alert('You are already scheduled during this time. Shift cannot be accepted.');
                return;
            }
    
            // Proceed with accepting the shift if no conflict
            const result = await acceptShiftOfferAPI(shiftId, employee.emp_id);
            console.log('Shift accepted:', result);
    
            setOpenShiftOffers((prevOffers) => prevOffers.filter((offer) => offer.shift_id !== shiftId));
    
            alert('Shift accepted successfully!');
        } catch (error) {
            console.error('Error accepting shift:', error);
            alert('Failed to accept the shift. Please try again.');
        }
    };

    // Render the mobile layout if it's a mobile screen
    if (isMobile) {
        return <EmployeePageMobile />;
    }

    if (!loggedInUser) {
        return <Text>Loading...</Text>; 
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style = {styles.container}>
        
                <NavBar homeRoute={'Employee'} showLogout={true}/>

                <View style = {styles.topContainer}>
                    <Text style={styles.dashboardText}> 
                        {loggedInUser?.employee?.is_manager ? 'Manager Dashboard' : 'Employee Dashboard'}
                    </Text>

                    <View style={styles.spacer} />

                    <Text style = {styles.welcomeText}>
                        {employee ? `Welcome, ${employee.f_name}` : 'Welcome, User'}
                    </Text> 

                    {/*<Image
                        resizeMode="contain"
                        source={require('../../assets/images/profile_photo_default.png')}
                        style={styles.profilePhoto}
                    />*/}
                </View>

                <View style = {styles.dashboardContainer}>
                    {/* Left Column */}
                    <View style={styles.leftColumn}>
                        {loggedInUser?.employee?.is_manager && (
                            <SidebarButton
                                icon={require('../../assets/images/calendar_with_gear.png')}
                                label="Manage Schedule"
                                onPress={() => navigation.navigate('ManageSchedule')}
                                customContainerStyle={{ right: -10 }}
                            />
                        )}
                        <SidebarButton
                            icon = {require('../../assets/images/view_calendar_icon.png')}
                            label = "View Schedule"
                            onPress={ () => navigation.navigate('ViewSchedule')}
                        />
                        {loggedInUser?.employee?.is_manager && (
                            <SidebarButton
                                icon={require('../../assets/images/add_employee_icon.png')}
                                label="Add Employee"
                                onPress={() => setAddEmpVisible(true)} // Open the Add Employee Modal
                                customContainerStyle={{ right: -10 }}
                            />
                        )}
                        <SidebarButton
                            icon = {require('../../assets/images/clipboard_with_checkmark.png')}
                            label = "Submit Request"
                            onPress={ () => {navigation.navigate('PTORequest')}}
                        />
                        <SidebarButton
                            icon = {require('../../assets/images/calendar_with_gear.png')}
                            label = "Change Availability"
                            onPress={ () => {{navigation.navigate('ChangeAvailability')}}}
                        />
                        {/* <SidebarButton
                            icon = {require('../../assets/images/time_card_icon.png')}
                            label = "Time Card History"
                            onPress={ () => {{/* Time Card History Page logic }}}
                            customContainerStyle={{ right: 5 }}
                            customIconStyle = {{width: 100, height: 100}}
                        /> */}
                    </View>

                    <View style={styles.spacer} />

                    {/* Right Column */}
                    <View style={styles.rightColumn}>
                        {/* Announcements Section */}
                        <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style={styles.gradientAnnounce}>
                            <View style={styles.announcements}>
                                <View style={styles.topBar}>
                                <Text style={styles.sectionTitle}>Announcements</Text>
                                <View style={styles.spacer} />

                                <View style={styles.topBarIcons}>
                                {loggedInUser?.employee?.is_manager ? (
                                    <>
                                        <TouchableOpacity style={styles.addIconContainer}>
                                            <Ionicons name="add-circle" size={28} color="black" onPress={() => {setAnnouncementsVisible(true); setOpenAddForm(true);}} />
                                        </TouchableOpacity>
                                        <Ionicons name="megaphone-outline" size={25} color="black" />
                                    </>
                                ) : (
                                    <Ionicons name="megaphone-outline" size={25} color="black" style={{ left: 23 }} />
                                )}
                                </View>

                                </View>
                                <TouchableOpacity style={styles.announcementBox} onPress={() => setAnnouncementsVisible(true)}>
                                {pulledGeneralAnnouncement.length === 0 ? (
                                        <Text style={{alignSelf: 'center'}}>No announcements at the moment.</Text>
                                    ) : (
                                        <View>
                                            <Text style={styles.announcementTitle}>{pulledGeneralAnnouncement[0].Title}</Text>
                                            <View style={styles.HDivider}/>
                                            <Text style={styles.announcementContent}>{pulledGeneralAnnouncement[0].Content}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>

                        {/* Requests Section */}
                        {loggedInUser?.employee?.is_manager && (
                            <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style={styles.gradient}>
                                <View style={{borderRadius: 10, padding: 20,}}>
                                    <View style={styles.topBar}>
                                        <Text style={styles.sectionTitle}>Manage Requests</Text>
                                    <View style={styles.spacer} />
                                        <Ionicons name="hourglass-outline" size={30} color="black" />
                                    </View>
                                    <View style={[styles.textBox, { height: 150 }]}>
                                        <Text style={{alignSelf: 'center'}}>No requests at the moment.</Text>
                                    </View>
                                    <View style={{width: '100%', alignSelf: 'flex-end', marginTop: 10,}}>
                                    <TouchableOpacity>
                                        <Text style={{alignSelf: 'flex-end'}}>View All Requests</Text>
                                    </TouchableOpacity>
                                    </View>  
                                </View>
                            </LinearGradient>
                        )}
  

                        {/* Upcoming Shifts Section */}
                        <LinearGradient 
                            colors={['#E7E7E7', '#A7CAD8']} 
                            style={styles.gradient}
                        >
                            <View style={styles.upcomingShiftsContainer}>
                                <View style={styles.topBar}>
                                    <Text style={styles.sectionTitle}>Upcoming Shift</Text>

                                    <View style={styles.spacer} />

                                    <Ionicons name="calendar-outline" size={30} color="black" />
                                </View>
                                <View style={[styles.textBox, { height: 100 }]}>
                                    {upcomingShift ? (
                                        <View style={{height: '100%', justifyContent: 'space-between'}}>
                                            <Text style={styles.shiftText}>
                                                Scheduled Hours: {upcomingShift.scheduledHours}
                                            </Text>
                                            <Text style={styles.shiftText}>
                                                Date: {new Date(upcomingShift.date).toLocaleDateString()}
                                            </Text>
                                            <Text style={styles.shiftText}>
                                                Time: {formatTime(upcomingShift.startTime)} - {formatTime(upcomingShift.endTime)}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.noShiftsText}>No upcoming shifts</Text>
                                    )}
                                </View>
                            </View>
                        </LinearGradient>
                         
                        {/* Available Shifts Section */}
                        <LinearGradient 
                            colors={['#E7E7E7', '#A7CAD8']} 
                            style={[styles.gradient2, { flex: 1 }]}
                        >
                            <View style={styles.availableShifts}>
                                <View style={styles.topBar}>
                                    <Text style={styles.sectionTitle}>Available Shifts</Text>

                                    <View style={styles.spacer} />

                                    <TouchableOpacity 
                                        style={[styles.availabilityButton, activeFilter === "With Availability" && styles.activeButton]}
                                        onPress={() => setActiveFilter("With Availability")}s
                                    >
                                        <Text style={styles.buttonText}>With Availability</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.shiftButton, activeFilter === "All Shifts" && styles.activeButton]}
                                        onPress={() => setActiveFilter("All Shifts")}
                                    >
                                        <Text style={styles.buttonText}>All Shifts</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={[styles.shiftCardContainer, { flex: 1 }]}>
                                    <ScrollView 
                                        style={{ flex: 1 }}
                                        contentContainerStyle={{ padding: 16 }}
                                    >
                            
                                    {filteredShifts.length > 0 ? ( 
                                        filteredShifts.map((offer) => {
                                            const addedHours = calculateHoursDifference(offer.start_time, offer.end_time);
                                            const totalHours = totalWeeklyHours + addedHours;
                        
                                            return (
                                                <ShiftCard
                                                    key={offer.shift_id}
                                                    shiftId={offer.shift_id}
                                                    date={offer.date}
                                                    time={`${formatTime(offer.start_time)} - ${formatTime(offer.end_time)}`}
                                                    addedHours={addedHours}
                                                    totalHours={totalHours}
                                                    onAddShift={(shiftId) => handleAcceptShift(shiftId, offer.date, offer.start_time, offer.end_time)}
                                                />
                                            );
                                        })
                                    ) : (
                                        <Text style={{marginTop: 50}}>No open shift offers available.</Text>
                                    )}

                                    </ScrollView>
                                </View>
                            </View>
                        </LinearGradient> 

                        <AddEmpModal 
                            addEmpVisible={addEmpVisible} 
                            setAddEmpVisible={setAddEmpVisible}
                            businessId={loggedInUser?.employee?.business_id}
                        />
                        <AnnouncementsModal
                            announcementsVisible={announcementsVisible}
                            setAnnouncementsVisible={(visible) => {
                                setAnnouncementsVisible(visible);
                                if (!visible) setOpenAddForm(false); // Reset the state when the modal is closed
                            }}
                            businessId={loggedInUser.employee.business_id}
                            isManager={loggedInUser.employee.is_manager}
                            openAddForm={openAddForm}
                        />   
                    </View>
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
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1, 
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 20,
        minHeight: '100%',
        height: 200,
        minWidth: 950,
    },
    topContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 70,
        marginTop: 20
    },
    spacer: {
        flexGrow: 2, // Grow dynamically to fill space
        flexShrink: 1, // Shrink if space is limited
    },
    dashboardText: {
        fontSize: 30
    },
    welcomeText: {
        fontSize: 20,
        paddingRight: 20
    },
    profilePhoto: {
        width: 50,        
        height: 50,       
        borderRadius: 25,  
        borderWidth: 2,    
        borderColor: '#ddd', 
    },
    dashboardContainer: {
        flexGrow: 1,
        width: '95%',
        maxWidth: 1200,
        flexDirection: 'row', // Two columns layout
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 50,
        paddingLeft: 40,
        paddingRight: 40,
    },
    leftColumn: {
        flex: 2,
        justifyContent: 'space-between',
        paddingTop: 20,
        maxWidth: 300,
        minWidth: 250,
    },
    rightColumn: {
        flex: 2,
        height: '100%',
        paddingTop: 20,
        maxWidth: 450,
        minWidth: 450,
        alignItems: "flex-end",
    },
    gradient: {
        width: '100%',
        //height: 150,
        //flex: 1,
        borderRadius: 10, 
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    gradientAnnounce: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 20, 
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    upcomingShiftsContainer: {
        //flex: 1,
        borderRadius: 10,
        padding: 20,
        marginBottom: 10,
    },
    announcements: {
        borderRadius: 10,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16
    },
    gradient2: {
        minWidth: '100%',
        borderRadius: 10, 
        marginTop: 20, 
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    textBox: {
        minheight: 100,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    announcementBox: {
        minheight: 100,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    announcementTitle: {
        left: 10,
        fontSize: 16,
        fontWeight: '600',
    },
    announcementContent: {
        left: 10,
        fontSize: 14,
    },
    HDivider: {
        borderBottomColor: 'lightgray',
        borderBottomWidth: 2,
        marginBottom: 10,
        marginTop: 5,
        width: '98%',
        alignSelf: 'center',
    },
    topBarIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 20,
    },
    addIconContainer: {
        width: '100%',
        alignItems: 'flex-end',
        right: 10,
    },
    availableShifts: {
        flex: 1,
        borderRadius: 10,
        padding: 20,
    },
    topBar: {
        flexDirection: 'row',
        paddingRight: 10,
    },
    availabilityButton: {
        width: 100,
        backgroundColor: '#A9C9D9',
        borderTopLeftRadius: 10,    
        borderBottomLeftRadius: 10,
        borderRightWidth: 1,        
        borderRightColor: 'grey',
        padding: 7,
        marginTop: 15,
        alignItems: 'center',
    },
    shiftButton: {
        width: 80,
        backgroundColor: '#A9C9D9',
        borderTopRightRadius: 10,    
        borderBottomRightRadius: 10,
        padding: 7,
        marginTop: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 10,
    },
    activeButton: {
        backgroundColor: '#7FA2B9', 
    },
    shiftCardContainer: {
        flex: 1,
        alignItems: 'center',
        overflow: 'hidden',
        minHeight: 150,
        // borderWidth: 2,
        // borderColor: 'green'
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

export default EmployeePage;