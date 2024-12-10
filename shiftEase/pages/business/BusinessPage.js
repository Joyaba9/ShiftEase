import React, { useState, useEffect } from 'react';
import { ScrollView, Image, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Platform,} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import NavBar from '../../components/NavBar.js';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import SidebarButton from '../../components/SidebarButton.js';
import BusinessPageMobile from './BusinessPageMobile.js';
import AddEmpModal from './AddEmpModal.js';
import AnnouncementsModal from './AnnouncementsModal.js';

const { width } = Dimensions.get('window');

const BusinessPage = () => {
  const navigation = useNavigation();
  const [isManagerDashboard, setIsManagerDashboard] = useState(false);
  const [pulledGeneralAnnouncement, setPulledGeneralAnnouncement] = useState([]);
  const [openAddForm, setOpenAddForm] = useState(false);
  const isMobile = width < 768; 

  // Access the logged-in business information from Redux
  const loggedInBusiness = useSelector((state) => state.business.businessInfo);

  // Check if the data exists
  useEffect(() => {
    if (!loggedInBusiness) {
        console.error('No business is logged in');
        navigation.replace('Login');
    }
  }, [loggedInBusiness, navigation]);

  // Function to switch between dashboards
  const switchDashboard = () => {
    setIsManagerDashboard(!isManagerDashboard); // Toggle between Business and Manager dashboard
  };

  const [addEmpVisible, setAddEmpVisible] = useState(false);
  const [announcementsVisible, setAnnouncementsVisible] = useState(false);

  const goToManageEmployeePage = () => {
    navigation.navigate('ManageEmployee'); // Navigate to ManageEmployeePage
  };

  // Pulls the latest general announcement to be displayed in announcement card
  const fetchLatestGeneralAnnouncements = async () => {
    try {
        const response = await fetch(`http://localhost:5050/api/announcements/general/latest/${loggedInBusiness.business.business_id}`);
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

  // Early loading check (non-hook related) to avoid return early
  if (!loggedInBusiness) {
    return (
      <div>
        <p>Loading...</p> {/* Fallback UI */}
      </div>
    );
  }

  // Render the mobile layout if it's a mobile screen
  if (isMobile) {
    return <BusinessPageMobile />;
  }

  const handleOpenWindow = () => {
    if (Platform.OS === 'web') {
      // This will open MessagesPage in a new browser tab
      window.open('/messages', '_blank', 'width=800,height=600,resizable,scrollbars');
    } else {
      // Fallback for mobile to navigate within the app
      navigation.navigate('Messages');
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

        <View style={styles.topContainer}>

          {/* Conditionally render the dashboard text based on state */}
          <Text style={styles.dashboardText}>
            {isManagerDashboard ? 'Manager Dashboard' : 'Business Dashboard'}
          </Text>

          {/* Button to switch between dashboards */}
          {/* <TouchableOpacity onPress={switchDashboard}>
            <Text style = {styles.managerText}>
              {isManagerDashboard ? 'Switch to Business Dashboard!' : 'Switch to Manager Dashboard!'}
            </Text>
          </TouchableOpacity> */}

        </View>
  
        <View style={styles.dashboardContainer}>
          {/* Left Column */}
          <View style={styles.leftPane}>
            {/* <SidebarButton
              icon={isManagerDashboard ? require('../../assets/images/calendar_with_gear.png') : require('../../assets/images/manage_business.png')}
              label={isManagerDashboard ? 'Manage Schedule' : 'Manage Business'}
              onPress={() => isManagerDashboard ? navigation.navigate('ManageSchedule') : navigation.navigate('ManageBusiness')}
              customContainerStyle={{ right: -10 }}
            /> */}
            <SidebarButton
              icon={require('../../assets/images/calendar_with_gear.png')}
              label= 'Manage Schedule'
              onPress={() =>  navigation.navigate('ManageSchedule')}
              customContainerStyle={{ right: -10 }}
            />
            <SidebarButton
              icon={require('../../assets/images/add_employee_icon.png')}
              label="Add Employee"
              onPress={() => setAddEmpVisible(true)} // Open the Add Employee Modal
              customContainerStyle={{ right: -10 }}
            />
            <SidebarButton
              icon={require('../../assets/images/employees_talking.png')}
              label="Manage Employee"
              onPress={goToManageEmployeePage} // Navigate to ManageEmployeePage
              customContainerStyle={{ right: 10 }}
            />
            <SidebarButton
              icon={require('../../assets/images/email_icon.png')}
              label="Messages"
              onPress={handleOpenWindow}
              customContainerStyle={{ right: 20 }}
              customIconStyle={{ width: 100, height: 100 }}
            />
            <SidebarButton
              icon={require('../../assets/images/edit_roles_icon_trans.png')}
              label="Edit Roles"
              onPress={() => navigation.navigate('EditRoles')}
              customContainerStyle={{ right: 10 }}
            />
          </View>

          <View style={styles.spacer} />

          {/* Right Column */}
          <View style={styles.rightPane}>
            {/* Announcements Section */}
            <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style={styles.gradientAnnounce}>
              <View style={styles.announcements}>
                <View style={styles.topBar}>
                <Text style={styles.sectionTitle}>Announcements</Text>
                <View style={styles.spacer} />

                  <View style={styles.topBarIcons}>
                      <TouchableOpacity style={styles.addIconContainer}>
                        <Ionicons name="add-circle" size={28} color="black" onPress={() => {setAnnouncementsVisible(true); setOpenAddForm(true);}} />
                      </TouchableOpacity>
                      <Ionicons name="megaphone-outline" size={25} color="black" />
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
            <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style={styles.gradient}>
              <View style={styles.sideContainer}>
                <View style={styles.topBar}>
                  <Text style={styles.sectionTitle}>Requests</Text>
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
  
            {/* Reports Section */}
            <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style={styles.gradient}>
              <View style={styles.sideContainer}>
                <View style={styles.topBar}>
                  <Text style={styles.sectionTitle}>Daily Reports</Text>
                  <View style={styles.spacer} />
                  <Ionicons name="document-text-outline" size={30} color="black" />
                </View>
                <View style={styles.textBox}>
                  <Text>This feature is not yet implemented. Coming soon!</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
  
        {/* Bottom Bar with Logo */}
        <LinearGradient colors={['#E7E7E7', '#9DCDCD']} style={styles.bottomBarContainer}>
          <Image resizeMode="contain" source={require('../../assets/images/logo1.png')} style={styles.desktopLogo} />
        </LinearGradient>
  
        <AddEmpModal 
          addEmpVisible={addEmpVisible} 
          setAddEmpVisible={setAddEmpVisible}
          businessId={loggedInBusiness.business.business_id}
        />

        <AnnouncementsModal
          announcementsVisible={announcementsVisible}
          setAnnouncementsVisible={(visible) => {
            setAnnouncementsVisible(visible);
            if (!visible) setOpenAddForm(false); // Reset the state when the modal is closed
          }}
          businessId={loggedInBusiness.business.business_id}
          isManager={true}
          openAddForm={openAddForm}
        />;
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
  },
  managerText: {
    fontSize: 16,
    paddingRight: 50
  },
  dashboardContainer: {
    flexGrow: 1,
    width: '95%',
    maxWidth: 1200,
    flexDirection: 'row', // Two columns layout
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 50,
    paddingTop: 20,
    paddingLeft: 40,
    paddingRight: 40,
  },
  dashboardText: {
    fontSize: 25,
    alignSelf: 'flex-start',
    //marginTop: 40,
    paddingLeft: 60
    
  },
  spacer: {
    flexGrow: 2, // Grow dynamically to fill space
    flexShrink: 1, // Shrink if space is limited
  },
  icon: {
    width: 50,
    height: 50
  },
  icon2: {
    width: 40,
    height: 40
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftPane: {
    flex: 2,
    justifyContent: 'space-between',
    paddingTop: 20,
    maxWidth: 300,
    minWidth: 250,
  },
  rightPane: {
    flex: 2,
    height: '100%',
    paddingTop: 20,
    maxWidth: 450,
    minWidth: 450,
    alignItems: "flex-end",
  },
  gradient: {
    width: '100%',
    height: 300,
    borderRadius: 10, 
    marginBottom: 40,
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
  addIconContainer: {
    width: '100%',
    alignItems: 'flex-end',
    right: 10,
  },
  addIconContainer2: {
    position: 'absolute',
    bottom: -150,
    right: 10,
    zIndex: 1,
  },
  sideContainer: {
    borderRadius: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16
  },
  textBox: {
    minheight: 150,
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
  button: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    color: '#333',
  },
  messagingHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  messagingBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
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
});

export default BusinessPage;
