import React, { useState, useEffect } from 'react';
import { ScrollView, Image, View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import NavBar from '../../components/NavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchScheduleAPI, fetchOpenShiftOffers } from '../../../backend/api/scheduleApi';
import { getStartOfWeek } from '../../components/schedule_components/useCalendar';
import { calculateHoursDifference, formatTime } from '../../components/schedule_components/scheduleUtils';
import SidebarButton from '../../components/SidebarButton';
import ShiftCard from '../../components/ShiftCard';
import EmployeePageMobile from './EmployeePageMobile';
import AnnouncementsModal from '../business/AnnouncementsModal';

const { width } = Dimensions.get('window');

const EmployeePage = () => {
    const isMobile = width < 768; 
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);

    // Retrieve the logged-in user from Redux store
    const loggedInUser = useSelector((state) => state.user.loggedInUser);
    console.log('Logged in user:', loggedInUser);

    useEffect(() => {
        if (!loggedInUser) {
            console.log("No logged-in user, redirecting to login page...");
            navigation.replace('Login');
        }
    }, [loggedInUser, navigation]);

    const employee = loggedInUser ? loggedInUser.employee : null;

    // State to control the visibility of the announcements modal
    const [announcementsVisible, setAnnouncementsVisible] = useState(false);
    // State for upcoming shifts
    const [upcomingShift, setUpcomingShift] = useState(null);
    const [openShiftOffers, setOpenShiftOffers] = useState([]);
    const [totalWeeklyHours, setTotalWeeklyHours] = useState(0);

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
                    return;
                }

                const scheduleId = scheduleData.schedule.schedule_id;
                const shifts = scheduleData.shifts;

                // Filter shifts for the logged-in employee and future dates
                const now = new Date();
                const employeeShifts = shifts.filter(
                    (shift) =>
                        shift.employeeId === employee.emp_id &&
                        new Date(shift.date) >= now
                );

                // Calculate total weekly hours
                let totalHours = 0;
                employeeShifts.forEach((shift) => {
                    totalHours += calculateHoursDifference(shift.startTime, shift.endTime);
                });
                setTotalWeeklyHours(totalHours);

                // Sort the shifts by date to find the most recent upcoming shift
                //employeeShifts.sort((a, b) => new Date(a.date) - new Date(b.date));

                // Find the next upcoming shift
                const futureShifts = employeeShifts.filter((shift) => new Date(shift.date) >= now);
                futureShifts.sort((a, b) => new Date(a.date) - new Date(b.date));

                if (futureShifts.length > 0) {
                    //setUpcomingShift(employeeShifts[0]);
                    const nextShift = employeeShifts[0];
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
        
                <NavBar />

                <View style = {styles.topContainer}>
                    <Text style={styles.dashboardText}> Employee Dashboard</Text>

                    <View style={styles.spacer} />

                    <Text style = {styles.welcomeText}>
                        {employee ? `Welcome, ${employee.f_name}` : 'Welcome, User'}
                    </Text> 

                    <Image
                        resizeMode="contain"
                        source={require('../../assets/images/profile_photo_default.png')}
                        style={styles.profilePhoto}
                    />
                </View>

                <View style = {styles.dashboardContainer}>
                    {/* Left Column */}
                    <View style={styles.leftColumn}>
                        <SidebarButton
                            icon = {require('../../assets/images/view_calendar_icon.png')}
                            label = "View Schedule"
                            onPress={ () => navigation.navigate('ViewSchedule')}
                        />
                        <SidebarButton
                            icon = {require('../../assets/images/clipboard_with_checkmark.png')}
                            label = "Submit Request"
                            onPress={ () => {navigation.navigate('PTORequest')}}
                        />
                        <SidebarButton
                            icon = {require('../../assets/images/calendar_with_gear.png')}
                            label = "Change Availability"
                            onPress={ () => {{/* Change Availability Page logic */}}}
                        />
                        {/*<SidebarButton
                            //icon = {require('../../assets/images/offer_up_icon.png')}
                            //label = "Offer Up Shift"
                            //onPress={ () => {{/* Offer Up Shift Page logic }}}
                            //customContainerStyle={{ right: -10 }}
                        />*/}
                        <SidebarButton
                            icon = {require('../../assets/images/time_card_icon.png')}
                            label = "Time Card History"
                            onPress={ () => {{/* Time Card History Page logic */}}}
                            customContainerStyle={{ right: 5 }}
                            customIconStyle = {{width: 100, height: 100}}
                        />
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
                                <Ionicons name="megaphone-outline" size={30} color="black" />
                                </View>
                                <View style={styles.textBox}></View>
                                <TouchableOpacity style={styles.addIconContainer}>
                                <Ionicons name="add-circle" size={50} color="black" onPress={() => setAnnouncementsVisible(true)}/>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>

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

                                    <TouchableOpacity style={styles.availabilityButton}>
                                        <Text style={styles.buttonText}>With Availability</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.shiftButton}>
                                        <Text style={styles.buttonText}>All Shifts</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={[styles.shiftCardContainer, { flex: 1 }]}>
                                    <ScrollView 
                                        style={{ flex: 1 }}
                                        contentContainerStyle={{ padding: 16 }}
                                    >
                                        {/* Check if there are open shift offers */}
                                        {openShiftOffers.length > 0 ? (
                                            openShiftOffers.map((offer) => {
                                                const addedHours = calculateHoursDifference(offer.start_time, offer.end_time);
                                                const totalHours = totalWeeklyHours + addedHours; // Adjust based on how total hours are stored
                                                
                                                return (
                                                    <ShiftCard
                                                        key={offer.shift_id}
                                                        date={offer.date}
                                                        time={`${formatTime(offer.start_time)} - ${formatTime(offer.end_time)}`}
                                                        addedHours={addedHours}
                                                        totalHours={totalHours}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <Text style={styles.noShiftsText}>No open shift offers available.</Text>
                                        )}
                                    </ScrollView>
                                </View>
                            </View>
                        </LinearGradient> 
                        <AnnouncementsModal
                            announcementsVisible={announcementsVisible}
                            setAnnouncementsVisible={setAnnouncementsVisible}
                            businessId={loggedInUser.employee.business_id}
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
        borderWidth: 2,
        borderColor: 'green'
    },
    announcements: {
        borderRadius: 10,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16
    },
    gradient2: {
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
        borderWidth: 2,
        borderColor: 'black'
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
    shiftCardContainer: {
        flex: 1,
        alignItems: 'center',
        overflow: 'hidden',
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