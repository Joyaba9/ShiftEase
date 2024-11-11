import React, { useState, useEffect } from 'react';
import { ScrollView, Image, View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import NavBar from '../../components/NavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SidebarButton from '../../components/SidebarButton';
import ShiftCard from '../../components/ShiftCard';
import EmployeePageMobile from './EmployeePageMobile';
import AnnouncementsModal from '../business/AnnouncementsModal';

const { width } = Dimensions.get('window');

const EmployeePage = () => {
    const navigation = useNavigation();
    const isMobile = width < 768; 

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
                            onPress={ () => {{/* Submit Request Page logic */}}}
                        />
                        <SidebarButton
                            icon = {require('../../assets/images/calendar_with_gear.png')}
                            label = "Change Availability"
                            onPress={ () => {{/* Change Availability Page logic */}}}
                        />
                        <SidebarButton
                            icon = {require('../../assets/images/offer_up_icon.png')}
                            label = "Offer Up Shift"
                            onPress={ () => {{/* Offer Up Shift Page logic */}}}
                            customContainerStyle={{ right: -10 }}
                        />
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
                            <View style={styles.announcements}>
                                <View style={styles.topBar}>
                                    <Text style={styles.sectionTitle}>Upcoming Shifts</Text>

                                    <View style={styles.spacer} />

                                    <Ionicons name="calendar-outline" size={30} color="black" />
                                </View>
                                <View style={styles.textBox}>
                                    {/* Display Upcoming Shifts Logic? */}
                                </View>
                            </View>
                        </LinearGradient>
                         
                        {/* Available Shifts Section */}
                        <LinearGradient 
                            colors={['#E7E7E7', '#A7CAD8']} 
                            style={styles.gradient2}
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

                                <View style={styles.shiftCardContainer}>
                                    {/* Where offered up shifts should be displayed */}
                                    <ShiftCard />
                                    
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
        height: 150,
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
    announcements: {
        borderRadius: 10,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16
    },
    gradient2: {
        width: '100%',
        height: 400,
        borderRadius: 10, 
        marginTop: 20, 
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    textBox: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    availableShifts: {
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
        alignItems: 'center',
        //backgroundColor: 'black',
        marginTop: 10
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