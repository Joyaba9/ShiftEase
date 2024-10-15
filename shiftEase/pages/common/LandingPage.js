import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, Image, ScrollView } from 'react-native';
import CommonLayout from './CommonLayout';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const LandingPage = () => {
  const navigation = useNavigation();

  return ( 
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.landingPage}>
        <View style={styles.TopFrame}>

          <TouchableOpacity 
              style={[styles.bubbleButton, styles.loginButton]} 
              onPress={() => navigation.navigate('Login')}
              >
              <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={() => { /* Add logic */ }}>
              <Text style={styles.buttonText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => { /* Add logic */ }}>
              <Text style={styles.buttonText}>Pricing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => { /* Add logic */ }}>
              <Text style={styles.buttonText}>Features</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => { /* Add logic */ }}>
              <Text style={styles.buttonText}>Contact</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topImage}>
            <Image source={require('../../assets/images/shiftEase_logo_trans.png')} resizeMode="contain"/>
          </View>

          <View>
            <Text style={styles.homeText}>Shifts Made Simple</Text>
            <Text style={styles.homeText}>    Teams Made Strong</Text>
          </View>

          <TouchableOpacity 
            style={[styles.bubbleButton, styles.registrationButton]} 
            onPress={() => navigation.navigate('Registration')}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

          <View style={styles.schedulingImage}>
          <Image 
            source={require('../../assets/images/scheduling_cartoon.png')} 
            resizeMode="contain"/>
          </View>

          <View style={styles.stickyNoteImage}>
          <Image 
            source={require('../../assets/images/stickyNote.png')} 
            resizeMode="contain"/>
          </View>

          <View>
            <Text style={styles.schedulingText}>The employee scheduling app that{'\n'}makes shift management easy</Text>
          </View>

          <View style={styles.boxRow}>
            <LinearGradient colors={['#E0FCFC', '#588989']} style={styles.box}>
              <Text style={styles.boxText}>EMPLOYEE SCHEDULING SOFTWARE</Text>
              <Image source={require('../../assets/images/calendar.png')} style={styles.boxImage} />
              <Text style={styles.boxHeader}>Schedule Faster</Text>
              <Text style={styles.boxText}>Create and share with{"\n"}your team in minutes</Text>
            </LinearGradient>

            <LinearGradient colors={['#E0FCFC', '#588989']} style={styles.box}>
              <Text style={styles.boxText}>EMPLOYEE TIME TRACKING</Text>
              <Image source={require('../../assets/images/clock1.png')} style={styles.boxImage} />
              <Text style={styles.boxHeader}>Track Time Easier</Text>
              <Text style={styles.boxText}>Integrate your schedule{"\n"}with the time clock and{"\n"}reduce labor costs.</Text>
            </LinearGradient>

            <LinearGradient colors={['#E0FCFC', '#588989']} style={styles.box}>
              <Text style={styles.boxText}>TEAM MESSAGING</Text>
              <Image source={require('../../assets/images/communication1.png')} style={styles.boxImage} />
              <Text style={styles.boxHeader}>Track Time Easier</Text>
              <Text style={styles.boxText}>Connect with everyone{"\n"}across any shift or any{"\n"}department.</Text>
            </LinearGradient>
          </View>

          <View style={styles.bottomBox}>
            <Image source={require('../../assets/images/boss.png')} style={styles.bottomBoxImage}/>
            <Text style={styles.bottomBoxText}>"It saves me 8 hours a week. Instead of texting back and forth all day, our employees can use the{"\n"}
              app to switch shifts up, and all I have to do is approve the swap. Love it." - Boss Man, Customer{"\n"}Since 2024</Text>
            <Image source={require('../../assets/images/quotes.png')} style={styles.quoteUpsideImage}/>
            <Image source={require('../../assets/images/quotes.png')} style={styles.quoteRightsideImage}/>
          </View>
        </View>

        <View style={styles.bottomFrame}>
          <Image source={require('../../assets/images/shiftEase_logo_trans.png')} style={styles.bottomImage}/>
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,   
  },
  landingPage: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  TopFrame: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    height: 300,
    width: '100%',
    backgroundColor: '#afcbcb',
    alignItems: 'center'
  },
  bottomFrame: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    height: 125,
    width: '100%',
    backgroundColor: '#afcbcb',
    alignItems: 'center',
    position: 'absolute', 
    bottom: -900,              
    left: 0,                     
    right: 0,     
  },
  bubbleButton: {
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 1)",
    width: 80,
    maxWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 5,
    shadowColor: '#000',             
    shadowOffset: { width: 2, height: 4 },  
    shadowOpacity: 0.5,            
    shadowRadius: 3.5, 
  },
  button: {
    marginHorizontal: 20,
    top: 25,       
    left: 350     
  },
  buttonText: {
    fontSize: 18,
    color: "rgba(17, 17, 17, 1)",
    fontWeight: "800",
  },
  loginButton: {
    position: 'absolute',
    top: 40,            
    right: 60
  },
  registrationButton: {
    width: 145,
    top: 80,
    left: -320
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    marginTop: 20,
  },
  topImage: {
    transform: [{ scaleX: .35 }, { scaleY: .35 }],
    position: 'absolute',  
    top: -40,                 
    left: -180,                
  },
  bottomImage: {
    transform: [{ scaleX: .35 }, { scaleY: .35 }],
    position: 'absolute',
    top: -30,                 
    right: -180,                 
  },
  schedulingImage: {
    transform: [{ scaleX: .75 }, { scaleY: .75 }],
    position: 'absolute',  
    top: 20,
    right: 175               
  },
  stickyNoteImage: {
    transform: [{ scaleX: .9 }, { scaleY: .9 }],
    position: 'absolute',
    top: 282,
    left: 120,             
  },
  quoteUpsideImage: {
    transform: [{ scaleX: .75 }, { scaleY: .75 }],
    position: 'absolute',
    right: -185,   
    top: -35,
  },
  quoteRightsideImage: {
    transform: [{ scaleX: .75 }, { scaleY: .75 }, {rotate: '180deg'}],
    position: 'absolute',
    bottom: -35,
    left: -190
  },
  homeText: {
    fontSize: 28,
    fontWeight: "500",
    left: -450,
    top: 65
  },
  schedulingText: {
    fontSize: 28,
    fontWeight: "640",
    top: 375,
    left: 250 
  },
  boxText: {
    fontSize: 17,
    fontWeight: "640",
  },
  boxHeader: {
    fontSize: 27,
    fontWeight: "640",
    paddingVertical: 20,
  },
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,          
  },
  box: {
    width: 350,
    height: 450,
    borderRadius: 20, 
    marginHorizontal: 70,
    top: 450,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBox: {
    flexDirection: 'row',        
    justifyContent: 'space-between',  
    alignItems: 'center',         
    backgroundColor: '#FDF6D9',   
    padding: 10,
    width: 1050,
    height: 125,
    top: 550
  },
  bottomBoxImage: {
    transform: [{ scaleX: .9 }, { scaleY: .9 }],
  },
  bottomBoxText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
},
    
});

export default LandingPage;
