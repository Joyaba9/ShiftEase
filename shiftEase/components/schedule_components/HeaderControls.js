import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDateRangeText, changeDate } from './useCalendar';

// HeaderControls component for managing view controls (Week/Day) and navigation (previous/next) in the header
const HeaderControls = ({ view, currentDate, setView, setCurrentDate }) => (
    <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style = {styles.topContainer}>
        {/* Section for toggling between Week and Day view */}
        <View style={styles.calendarButtonsContainer}>
            <TouchableOpacity style={[styles.calendarButton, view === 'week' && styles.activeView]} onPress={() => setView('week')}>
                <Text style={styles.buttonText}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.calendarButton, view === 'day' && styles.activeView]} onPress={() => setView('day')}>
                <Text style={styles.buttonText}>Day</Text>
            </TouchableOpacity>
        </View>
        
        {/* Display the current date range (week or day) */}
        <Text style={styles.dateText}>{getDateRangeText(view, currentDate)}</Text>

        {/* Navigation arrows for changing the date (previous/next week or day) */}
        <View style={styles.arrowButtons}>
            <TouchableOpacity style={styles.arrow} onPress={() => setCurrentDate(changeDate(view, currentDate, 'prev'))}>
                <Ionicons name="arrow-back-outline" size={15} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.arrow} onPress={() => setCurrentDate(changeDate(view, currentDate, 'next'))}>
                <Ionicons name="arrow-forward-outline" size={15} color="black" />
            </TouchableOpacity>
        </View>
    </LinearGradient>
);

const styles = StyleSheet.create({
    topContainer: {
        flexDirection: 'row',
        height: 80,
        width: '100%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 30,
        backgroundColor: 'white',
    },
    calendarButtonsContainer: {
        flexDirection: 'row',
        marginLeft: 20,
    },
    calendarButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 5,
        paddingHorizontal: 10,
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
});

export default HeaderControls;

