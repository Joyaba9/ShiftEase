import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, Image, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import NavBar from '../../components/NavBar';
import SidebarButton from '../../components/SidebarButton';
import BusinessPageMobile from './BusinessPageMobile';

const { width } = Dimensions.get('window');

const BusinessPage = () => {
  const navigation = useNavigation();
  const [isManagerDashboard, setIsManagerDashboard] = useState(false);
  const isMobile = width < 768; 

  // Render the mobile layout if it's a mobile screen
  if (isMobile) {
    return <BusinessPageMobile />;
  }

  // Function to switch between dashboards
  const switchDashboard = () => {
    setIsManagerDashboard(!isManagerDashboard); // Toggle between Business and Manager dashboard
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
      
        <NavBar />
        
        <View style={styles.topContainer}>

          {/* Conditionally render the dashboard text based on state */}
          <Text style={styles.dashboardText}>
            {isManagerDashboard ? 'Manager Dashboard' : 'Business Dashboard'}
          </Text>

          {/* Button to switch between dashboards */}
          <TouchableOpacity onPress={switchDashboard}>
            <Text style = {styles.managerText}>
              {isManagerDashboard ? 'Switch to Business Dashboard!' : 'Switch to Manager Dashboard!'}
            </Text>
          </TouchableOpacity>

        </View>
        
        <View style={styles.dashboardContainer}>
          {/* Left Column */}
          <View style={styles.leftPane}>

            <SidebarButton
                icon = {isManagerDashboard ? require('../../assets/images/calendar_with_gear.png') : require('../../assets/images/manage_business.png')}
                label = {isManagerDashboard ? 'Manage Schedule' : 'Manage Business'}
                onPress={ () => navigation.navigate('ManageBusiness')}
                customContainerStyle={{ right: -10 }}
            />
            <SidebarButton
                icon = {require('../../assets/images/add_employee_icon.png')}
                label = "Add Employee"
                onPress={ () => {}}
                customContainerStyle={{ right: -10 }}
            />
            <SidebarButton
                icon = {require('../../assets/images/employees_talking.png')}
                label = "Manage Employee"
                onPress={ () => {}}
                customContainerStyle={{ right: 10 }}
            />
            <SidebarButton
                icon = {require('../../assets/images/email_icon.png')}
                label = "Messages"
                onPress={ () => {}}
                customContainerStyle={{ right: 20 }}
                customIconStyle={{ width: 100, height: 100 }}
            />
            <SidebarButton
                icon = {require('../../assets/images/edit_roles_icon_trans.png')}
                label = "Edit Roles"
                onPress={ () => {}}
                customContainerStyle={{ right: 10 }}
            />
          </View>

          <View style={styles.spacer} />
          
          {/* Right Column */}
          <View style={styles.rightPane}>

            {/* Announcements Section */}
            <LinearGradient 
              colors={['#E7E7E7', '#A7CAD8']} 
              style={styles.gradientAnnounce}
            >
              <View style={styles.announcements}>
                <View style={styles.topBar}>
                  <Text style={styles.sectionTitle}>Announcements</Text>
                            
                  <View style={styles.spacer} />
                            
                  <Ionicons name="megaphone-outline" size={30} color="black" />
                </View>
                <View style={styles.textBox}>
                    {/* Add Announcements Logic? */}
                </View>
                            
                <TouchableOpacity style={styles.addIconContainer}>
                  <Ionicons name="add-circle" size={50} color="black" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Reports Section */}
            <LinearGradient 
              colors={['#E7E7E7', '#A7CAD8']} 
              style={styles.gradient}
            >
                <View style={styles.reportsContainer}>
                  <View style={styles.topBar}>
                    <Text style={styles.sectionTitle}>Daily Reports</Text>
                    
                    <View style={styles.spacer} />
                    
                    <Ionicons name="document-text-outline" size={30} color="black" />
                  </View>
                    <View style={styles.textBox}>
                        {/* Add Reports Logic? */}
                    </View>
                </View>
            </LinearGradient>

            {/* Key Performance Section */}
            <LinearGradient 
              colors={['#E7E7E7', '#A7CAD8']} 
              style={styles.gradient}
            >
              <View style={styles.performanceContainer}>
                <View style={styles.topBar}>
                  <Text style={styles.sectionTitle}>Key Performance Overview</Text>
                  
                  <View style={styles.spacer} />

                  <Ionicons name="bar-chart-outline" size={30} color="black" />
                  
                </View>

                <View style={styles.textBox}>
                    {/* Add Performance Logic? */}
                </View>

                <TouchableOpacity style={styles.addIconContainer2}>
                  <Ionicons name="add-circle" size={50} color="black" />
                </TouchableOpacity>
                
              </View>  
            </LinearGradient>
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
    //paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
  },
  dashboardText: {
    fontSize: 25,
    alignSelf: 'flex-start',
    marginTop: 40,
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
    position: 'absolute',
    bottom: -60,
    right: 10,
    zIndex: 1,
  },
  addIconContainer2: {
    position: 'absolute',
    bottom: -150,
    right: 10,
    zIndex: 1,
  },
  reportsContainer: {
    borderRadius: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16
  },
  performanceContainer: {
    borderRadius: 10,
    padding: 20,
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

  textBox: {
    flex: 1,
    //backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 15,
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


export default BusinessPage;
