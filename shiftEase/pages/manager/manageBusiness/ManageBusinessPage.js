import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, Image, View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import NavBar from '../../../components/NavBar';
import ManageLocations from './ManageLocations';
import Schedule from './Schedule';

const { width } = Dimensions.get('window');

const ManageBusinessPage = () => {
    const navigation = useNavigation();
    const isMobile = width < 768; 

    const [view, setView] = useState('week'); // 'week', 'day'
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const employeeNames = ['Jessalyn Otero', 'Nathanael Germain', 'Bryan Joya', 'Patricio Noles', 'Anthony Selvaggio'];
    
    const [selectedSection, setSelectedSection] = useState('Agenda Overview');

    const handleSideButtonPress = (section) => {
        setSelectedSection(section);
    };

    const [locations, setLocations] = useState([
        { location_id: 1, name: 'Main Office', address: '123 Main St, City', type: 'Office', employees: 10 }
    ]);

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

    const renderRightSidebarContent = () => {
        switch (selectedSection) {
            case 'Agenda Overview':
                return <Text style={styles.rightSideBarText}>Agenda Overview Content</Text>;
            case 'Manage Locations':
                return <ManageLocations locations={locations} setLocations={setLocations} />;
            case 'Manage Departments':
                return <Text style={styles.rightSideBarText}>Manage Departments Content</Text>;
            case 'Business Reports':
                return <Text style={styles.rightSideBarText}>Business Reports Content</Text>;
            case 'Time Card Overview':
                return <Text style={styles.rightSideBarText}>Time Card Overview Content</Text>;
            default:
                return <Text style={styles.rightSideBarText}>Default Content</Text>;
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
      
                <NavBar homeRoute="Manager"/>
                <Text style={styles.dashboardText}> Manage Business</Text>

                <View style={styles.topContainer}>
                    <Image
                        source={require('../../../assets/images/default_profile.png')}
                        style={styles.profileImage}
                    />

                    <View style={styles.sideContainer}>
                        <Text style={styles.businessText}> Business Name</Text>      

                        <View style={styles.metricsTotalContainer}>
                            <View style={styles.soleMetricContainer}>
                                <Text style={styles.numbersText}> 800 </Text>
                                <Text style={styles.bottomText}> Total Hours </Text>
                            </View>
                            <View style={styles.soleMetricContainer}>
                                <Text style={styles.numbersText}> 30,000 </Text>
                                <Text style={styles.bottomText}> Total Payroll </Text>
                            </View>
                            <View style={styles.soleMetricContainer}>
                                <Text style={styles.numbersText}> 90,000 </Text>
                                <Text style={styles.bottomText}> Expected Revenue </Text>
                            </View>
                            <View style={styles.soleMetricContainer}>
                                <Text style={styles.numbersText}> 60,000 </Text>
                                <Text style={styles.bottomText}> Expected Profit </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Schedule Section */}
                <LinearGradient 
                    colors={['#E7E7E7', '#A7CAD8']} 
                    style={styles.gradient}
                >
                    <View style={styles.scheduleContainer}>
                        <View style={styles.topBar}>

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

                        {/* Schedule Display */}
                        <Schedule 
                            employeeNames={employeeNames} 
                            currentDate={currentDate} 
                            view={view} 
                        />

                        <TouchableOpacity style={styles.editScheduleButton} onPress={() => {}}>
                            <Text style={styles.editText}>Edit Schedule</Text>
                        </TouchableOpacity>

                    </View>  
                </LinearGradient>

                <View style = {styles.bottomSection}>
                    <View style = {styles.leftSideBar}>
                        <TouchableOpacity style={[styles.sideButton, selectedSection === 'Agenda Overview' && styles.activeSideButton]} onPress={() => handleSideButtonPress('Agenda Overview')}>
                            <Text style={styles.sideText}>Agenda Overview</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.sideButton, selectedSection === 'Manage Locations' && styles.activeSideButton]} onPress={() => handleSideButtonPress('Manage Locations')}>
                            <Text style={styles.sideText}>Manage Locations</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.sideButton, selectedSection === 'Manage Departments' && styles.activeSideButton]} onPress={() => handleSideButtonPress('Manage Departments')}>
                            <Text style={styles.sideText}>Manage Departments</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.sideButton, selectedSection === 'Business Reports' && styles.activeSideButton]} onPress={() => handleSideButtonPress('Business Reports')}>
                            <Text style={styles.sideText}>Business Reports</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.sideButton, selectedSection === 'Time Card Overview' && styles.activeSideButton]} onPress={() => handleSideButtonPress('Time Card Overview')}>
                            <Text style={styles.sideText}>Time Card Overview</Text>
                        </TouchableOpacity>
                    </View>

                    <View style = {styles.rightSideBar}>
                        {renderRightSidebarContent()}
                    </View>
                </View>

                {/* Bottom Bar with Logo */}
                <LinearGradient 
                    colors={['#E7E7E7', '#9DCDCD']} 
                    style={styles.bottomBarContainer}
                >
                    <Image
                        resizeMode="contain"
                        source={require('../../../assets/images/logo1.png')}
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
      height: 500,
      minWidth: 950,
    },
    dashboardText: {
        fontSize: 30,
        alignSelf: 'flex-start',
        marginTop: 40,
        paddingLeft: 20
    },
    topContainer: {
        flexDirection: 'row',
        marginTop: 15,
        alignSelf: 'flex-start',
        marginLeft: 100,
        
    },
    profileImage: {
        width: 130,
        height: 130,
        borderRadius: 65,
    },
    sideContainer: {
        flexDirection: 'column',
        //borderWidth: 2,
        //borderColor: 'red'
    },
    businessText: {
        fontSize: 30,
        marginTop: 10,
        marginLeft: 20
    },
    metricsTotalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginLeft: 40
    },
    soleMetricContainer: {
        alignItems: 'center',
        marginTop: 20
    },
    numbersText: {
        fontSize: 25,
    },
    bottomText: {
        marginTop: 10
    },
    gradient: {
        width: '95%',
        //height: 300,
        borderRadius: 10, 
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20
        //borderWidth: 2,
        //borderColor: 'red'

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
    
    
    
    
    editScheduleButton: {
        borderRadius: 16,
        backgroundColor: 'rgba(17, 17, 17, 1)',
        width: 120,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        paddingVertical: 10,
        marginVertical: 15,
        marginRight: 20
    },
    editText: {
        color: 'white'
    },
    bottomSection: {
        flexDirection: 'row',
        width: '95%',
        height: 600,
        marginVertical: 60,
        paddingRight: 20,
        //borderWidth: 2,
        //borderColor: 'black'
    },
    sideText: {
        fontSize: 18,
        marginBottom: 20
    },
    sideButton: {
        //backgroundColor: '#AACCDA',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
        paddingTop: 20,
        paddingLeft: 20
    },
    activeSideButton: {
        backgroundColor: '#A7CAD8', // Blue background when selected
    },
    leftSideBar: {
        flex: 1,
        paddingTop: 10,
        paddingLeft: 10
        
    },
    rightSideBar: {
        flex: 4,
        //backgroundColor: '#AACCDA',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'red'
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

export default ManageBusinessPage;