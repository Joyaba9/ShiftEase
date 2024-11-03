import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Image, ScrollView, Picker, Button, Alert, Modal, Pressable } from 'react-native';
import NavBar from '../../components/NavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

const SettingsPage = () => {
  const businessId = useSelector(state => state.business.businessInfo?.business?.business_id);

  if (!businessId) {
    console.error("businessId is undefined");
    return <Text>Error: Business ID not found.</Text>;
  }

  const [canAddManager, setCanAddManager] = useState(false);
  const [canChangeAvailability, setCanChangeAvailability] = useState(false);
  const [shiftOfferRestriction, setShiftOfferRestriction] = useState(false);
  const [canMessageManagers, setCanMessageManagers] = useState(false);
  const [ptoEligibilityMonths, setPtoEligibilityMonths] = useState(1);
  const [requestSubmissionWeeks, setRequestSubmissionWeeks] = useState(2);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [initialPreferences, setInitialPreferences] = useState(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch(`http://localhost:5050/api/preferences/get/${businessId}`);
        if (!response.ok) throw new Error("Failed to fetch preferences");

        const data = await response.json();

        const initialValues = {
          canAddManager: data.some(pref => pref.preference_id === 7 && (pref.number === '0' || pref.number === 0)),
          canChangeAvailability: data.some(pref => pref.preference_id === 8 && (pref.number === '0' || pref.number === 0)),
          shiftOfferRestriction: data.some(pref => pref.preference_id === 9 && (pref.number === '0' || pref.number === 0)),
          canMessageManagers: data.some(pref => pref.preference_id === 10 && (pref.number === '0' || pref.number === 0)),
          ptoEligibilityMonths: data.find(pref => pref.preference_id === 11)?.number || 1,
          requestSubmissionWeeks: data.find(pref => pref.preference_id === 12)?.number || 2,
        };

        setCanAddManager(initialValues.canAddManager);
        setCanChangeAvailability(initialValues.canChangeAvailability);
        setShiftOfferRestriction(initialValues.shiftOfferRestriction);
        setCanMessageManagers(initialValues.canMessageManagers);
        setPtoEligibilityMonths(parseInt(initialValues.ptoEligibilityMonths, 10));
        setRequestSubmissionWeeks(parseInt(initialValues.requestSubmissionWeeks, 10));
        setInitialPreferences(initialValues);
      } catch (error) {
        console.error("Error fetching preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [businessId]);

  const handleSaveChanges = async () => {
    try {
      const preferencesData = {
        business_id: businessId,
        toggles: [
          canAddManager ? 7 : null,
          canChangeAvailability ? 8 : null,
          shiftOfferRestriction ? 9 : null,
          canMessageManagers ? 10 : null,
        ].filter(Boolean),
        dropdowns: [
          { preference_id: 11, number: ptoEligibilityMonths },
          { preference_id: 12, number: requestSubmissionWeeks },
        ],
      };

      const response = await fetch(`http://localhost:5050/api/preferences/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferencesData),
      });

      if (response.ok) {
        setSaveMessage("Changes Saved Successfully!");
        setTimeout(() => setSaveMessage(''), 5000);
      } else {
        throw new Error("Failed to save preferences.");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "Failed to save preferences.");
    }
  };

  const handleCancel = () => {
    setModalVisible(true);
  };

  const confirmCancel = () => {
    if (initialPreferences) {
      setCanAddManager(initialPreferences.canAddManager);
      setCanChangeAvailability(initialPreferences.canChangeAvailability);
      setShiftOfferRestriction(initialPreferences.shiftOfferRestriction);
      setCanMessageManagers(initialPreferences.canMessageManagers);
      setPtoEligibilityMonths(parseInt(initialPreferences.ptoEligibilityMonths, 10));
      setRequestSubmissionWeeks(parseInt(initialPreferences.requestSubmissionWeeks, 10));
    }
    setModalVisible(false);
  };

  if (loading) {
    return <Text>Loading Preferences...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NavBar homeRoute={'Business'} />
      <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style={styles.gradient}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Preferences</Text>
        </View>

        {saveMessage ? <Text style={styles.saveMessage}>{saveMessage}</Text> : null}

        <View style={styles.preferenceContainer}>
          <Text style={styles.preferenceLabel}>Can a manager add an employee with a manager role?</Text>
          <Switch value={canAddManager} onValueChange={() => setCanAddManager(prev => !prev)} />
        </View>

        <View style={styles.preferenceContainer}>
          <Text style={styles.preferenceLabel}>Can an employee change availability?</Text>
          <Switch value={canChangeAvailability} onValueChange={() => setCanChangeAvailability(prev => !prev)} />
        </View>

        <View style={styles.preferenceContainer}>
          <Text style={styles.preferenceLabel}>Restrict shift offers to same role</Text>
          <Switch value={shiftOfferRestriction} onValueChange={() => setShiftOfferRestriction(prev => !prev)} />
        </View>

        <View style={styles.preferenceContainer}>
          <Text style={styles.preferenceLabel}>Can Employees send messages to Managers?</Text>
          <Switch value={canMessageManagers} onValueChange={() => setCanMessageManagers(prev => !prev)} />
        </View>

        <View style={styles.preferenceContainer}>
          <Text style={styles.preferenceLabel}>PTO Eligibility Period (months)</Text>
          <Picker
            selectedValue={ptoEligibilityMonths}
            style={styles.picker}
            onValueChange={(value) => setPtoEligibilityMonths(value)}
          >
            {[...Array(13)].map((_, i) => (
              <Picker.Item key={i} label={`${i} month${i !== 1 ? 's' : ''}`} value={i} />
            ))}
          </Picker>
        </View>

        <View style={styles.preferenceContainer}>
          <Text style={styles.preferenceLabel}>How long in advance for a request submission (weeks)</Text>
          <Picker
            selectedValue={requestSubmissionWeeks}
            style={styles.picker}
            onValueChange={(value) => setRequestSubmissionWeeks(value)}
          >
            {[...Array(13)].map((_, i) => (
              <Picker.Item key={i} label={`${i} week${i !== 1 ? 's' : ''}`} value={i} />
            ))}
          </Picker>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Save Changes" onPress={handleSaveChanges} />
          <View style={styles.cancelButtonContainer}>
            <Button title="Cancel" color="gray" onPress={handleCancel} />
          </View>
        </View>
      </LinearGradient>
      <LinearGradient colors={['#E7E7E7', '#9DCDCD']} style={styles.bottomBarContainer}>
        <Image resizeMode="contain" source={require('../../assets/images/logo1.png')} style={styles.desktopLogo} />
      </LinearGradient>

      {/* Cancel Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Are you sure you want to cancel your changes?</Text>
            <Pressable style={styles.modalButton} onPress={confirmCancel}>
              <Text style={styles.modalButtonText}>Yes, cancel changes</Text>
            </Pressable>
            <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>No, keep changes</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 20,
    minHeight: '100%',
    height: 200,
    minWidth: 950,
  },
  gradient: {
    width: '95%',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
    marginBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  preferenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  preferenceLabel: {
    fontSize: 18,
  },
  picker: {
    height: 50,
    width: 150,
  },
  buttonContainer: {
    marginTop: 20,
  },
  saveMessage: { 
    color: 'green', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  cancelButtonContainer: {
    marginTop: 10, 
  },
  bottomBarContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  desktopLogo: {
    width: 300,
    height: 50,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#A7CAD8',
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SettingsPage;
