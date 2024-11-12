import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Picker } from 'react-native';
import { Calendar } from 'react-native-calendars';

const { width } = Dimensions.get('window');

const AddPTORequest = ({ addRequestVisible, setAddRequestVisible}) => {
    const isMobile = width < 768;
    const [selectedPTOType, setSelectedPTOType] = useState("");
    const [selectedTimeOption, setSelectedTimeOption] = useState("One Day");
    const timeOptions = ["One Day", "Multi-Day"];
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const loggedInUser = useSelector((state) => state.user.loggedInUser);
    const businessId = loggedInUser?.employee?.business_id;
    const loggedInEmployeeId = loggedInUser?.employee?.emp_id;

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [markedStartDate, setMarkedStartDate] = useState({});
    const [markedEndDate, setMarkedEndDate] = useState({});
    const [requestComments, setRequestComments] = useState('');
    const [startTime, setStartTime] = useState('9:00 AM');
    const [endTime, setEndTime] = useState('5:00 PM');

    const handleAddRequest = async () => {
        if (!loggedInEmployeeId || !businessId ) {
            alert('Error with emp or bus id');
            return;
        }

        const adjustedEndDate = selectedTimeOption === 'One Day' ? startDate : endDate;

        try {
            console.log('Payload being sent:', {
                loggedInEmployeeId,
                businessId,
                selectedPTOType,
                selectedTimeOption,
                startDate,
                endDate,
                startTime,
                endTime,
                requestComments
            });
        
            const response = await fetch('http://localhost:5050/api/employee/addRequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emp_id: loggedInEmployeeId,
                    business_id: businessId,
                    request_type: selectedPTOType,
                    day_type: selectedTimeOption,
                    start_date: startDate,
                    end_date: adjustedEndDate,
                    start_time: startTime,
                    end_time: endTime,
                    reason: requestComments
                }),
            });
        
            const data = await response.json();
        
            if (response.ok) {
                alert('Added request successfully');
                // Clear input fields
                setSelectedPTOType('');
                setSelectedTimeOption('One Day');
                setStartDate('');
                setEndDate('');
                setStartTime('9:00 AM');
                setEndTime('5:00 PM');
                setRequestComments(''); 
            } else {
                console.error('Failed to add request:', data);
                alert(data.message || 'Failed to add request');
            }
        } catch (err) {
            console.error('Error during adding request:', err);
            alert('Error adding request');
        }
    }

    const handleDayPress1 = (day) => {
        setStartDate(day.dateString);
        setMarkedStartDate({
            [day.dateString]: { selected: true, selectedColor: '#9DCDCD' },
        });
    };

    const handleDayPress2 = (day) => {
        setEndDate(day.dateString);
        setMarkedEndDate({
            [day.dateString]: { selected: true, selectedColor: '#9DCDCD' },
        });
    };

    const handleCancel = () => {
        setAddRequestVisible(false);
    };

    // Function to generate time options from 9 AM to 5 PM in 30-minute increments
    const generateTimeOptions = () => {
        const times = [];
        const startHour = 9; // 9 AM
        const endHour = 17; // 5 PM

        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minutes = 0; minutes < 60; minutes += 30) {
                const period = hour < 12 ? 'AM' : 'PM';
                const displayHour = hour > 12 ? hour - 12 : hour; // convert 24-hour to 12-hour format
                const time = `${displayHour}:${minutes === 0 ? '00' : minutes} ${period}`;
                times.push(time);
            }
        }
        return times;
    };

    const timeOptionsList = generateTimeOptions();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={addRequestVisible}
            onRequestClose={() => setAddRequestVisible(false)}
        >
            <View style={styles.screenGray}>
                <View style={styles.AddRequestContainer}>
                    <Text style={styles.modalHeader}>Submit a Request</Text>
                    <Text style={styles.dateText}>Created Request Date: {formattedDate}</Text>
                    <View style={styles.HDivider} />

                    <View style={styles.contentContainer}>
                        {/* Left Column: Calendars */}
                        <View style={styles.leftColumn}>
                            <View style={styles.calendarsContainer}>
                                {selectedTimeOption === "One Day" && (
                                    <View style={styles.calendarWrapperSingle}>
                                        <Text style={styles.calendarLabel}>Select a Date</Text>
                                        <Calendar
                                            style={styles.calendar}
                                            current={formattedDate}
                                            onDayPress={handleDayPress1}
                                            markedDates={markedStartDate}
                                        />
                                    </View>
                                )}
                                {selectedTimeOption === "Multi-Day" && (
                                    <View style={styles.calendarsRow}>
                                        <View style={styles.calendarWrapper}>
                                            <Text style={styles.calendarLabel}>Start Date</Text>
                                            <Calendar
                                                style={styles.calendar}
                                                current={formattedDate}
                                                onDayPress={handleDayPress1}
                                                markedDates={markedStartDate}
                                            />
                                        </View>
                                        <View style={styles.calendarWrapper}>
                                            <Text style={styles.calendarLabel}>End Date</Text>
                                            <Calendar
                                                style={styles.calendar}
                                                current={formattedDate}
                                                onDayPress={handleDayPress2}
                                                markedDates={markedEndDate}
                                            />
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.VDivider} />

                        {/* Right Column: PTO Type Section */}
                        <View style={styles.rightColumn}>
                            <Text style={styles.sectionLabel}>Time Duration</Text>
                            <View style={styles.HDivider} />
                            
                            <View style={styles.radioGroup}>
                                {timeOptions.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.radioButtonContainer}
                                        onPress={() => {
                                            setSelectedTimeOption(option);
                                            if (option !== "One Day") {
                                                setStartTime('9:00 AM');
                                                setEndTime('9:30 AM'); 
                                            }
                                        }}
                                    >
                                        <View style={styles.radioButton}>
                                            {selectedTimeOption === option && <View style={styles.radioButtonSelected} />}
                                        </View>
                                        <Text style={styles.radioText}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {selectedTimeOption === "One Day" && (
                                <View style={styles.timePickerContainer}>
                                    <Text style={styles.timeLabel}>Start Time</Text>
                                    <Picker
                                        selectedValue={startTime}
                                        onValueChange={(itemValue) => setStartTime(itemValue)}
                                        style={styles.ptoTimePicker}
                                    >
                                        {timeOptionsList.map((time, index) => (
                                            <Picker.Item key={index} label={time} value={time} />
                                        ))}
                                    </Picker>

                                    <Text style={styles.timeLabel}>End Time</Text>
                                    <Picker
                                        selectedValue={endTime}
                                        onValueChange={(itemValue) => setEndTime(itemValue)}
                                        style={styles.ptoTimePicker}
                                    >
                                        {timeOptionsList.map((time, index) => (
                                            <Picker.Item key={index} label={time} value={time} />
                                        ))}
                                    </Picker>
                                </View>
                            )}

                            <Text style={styles.sectionLabel}>Select PTO Type</Text>
                            <View style={styles.HDivider} />
                            <Picker
                                selectedValue={selectedPTOType}
                                onValueChange={(itemValue) => setSelectedPTOType(itemValue)}
                                style={styles.ptoTypePicker}
                            >
                                <Picker.Item label="Select PTO Type" value="" enabled={false} />
                                <Picker.Item label="Vacation" value="vacation" />
                                <Picker.Item label="Personal" value="personal" />
                                <Picker.Item label="Sick Time" value="sick" />
                            </Picker>

                            <Text style={styles.sectionLabel}>Comments</Text>
                            <View style={styles.HDivider}/>

                            <TextInput
                                style={styles.textBox}
                                placeholder="Enter any additional comments"
                                value={requestComments}
                                onChangeText={setRequestComments}
                                multiline
                            />

                        </View>
                    </View>

                    <View style={styles.buttonRowContainer}>
                        <TouchableOpacity style={styles.bubbleButton} onPress={handleAddRequest}>
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.bubbleButton} onPress={handleCancel}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    screenGray: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 20,
    },
    AddRequestContainer: {
        width: '98%',
        height: '85%',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        padding: 20,
    },
    contentContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    leftColumn: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
        backgroundColor: '#E0E4E8',
        borderRadius: 20,
    },
    rightColumn: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
    },
    calendarsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    calendarWrapper: {
        flex: 1,
        marginHorizontal: 40,
        alignItems: 'center',
        width: '100%',
    },
    calendarWrapperSingle: {
        alignItems: 'center',
    },
    calendarLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    calendar: {
        width: '120%',
        height: '105%',
        alignSelf: 'center',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    radioGroup: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        marginBottom: 20,
    },
    radioButtonContainer: {
        flexDirection: "row",
    },
    radioButton: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    radioButtonSelected: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: "#000",
    },
    radioText: {
        fontSize: 16,
    },
    timePickerContainer: {
        flexDirection: "row", 
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    timeLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    ptoTypePicker: {
        height: 30,
        width: '100%',
        marginBottom: 10,
    },
    ptoTimePicker: {
        height: 30,
        width: '30%',
        marginBottom: 10,
    },
    bubbleButton: {
        borderRadius: 50,
        backgroundColor: '#9FCCF5',
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 3.5,
        marginLeft: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#333',
    },
    modalHeader: {
        fontSize: 40,
        paddingHorizontal: 20,
        paddingTop: 15,
        fontWeight: '400',
    },
    dateText: {
        fontSize: 20,
        marginLeft: 'auto',
        marginTop: -20
    },
    HDivider: {
        borderBottomColor: 'lightgray',
        borderBottomWidth: 2,
        marginVertical: 8,
        width: '100%',
        alignSelf: 'center',
    },
    VDivider: {
        width: 1,
        height: '100%',
        backgroundColor: 'gray',
        marginHorizontal: 20,
    },
    buttonRowContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 20,
        paddingBottom: 10,
    },
    textBox: {
        height: 100,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        textAlignVertical: 'top', 
        marginBottom: 20,
    },
});

export default AddPTORequest;
