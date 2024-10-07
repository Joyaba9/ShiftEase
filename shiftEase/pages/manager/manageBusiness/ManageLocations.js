import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ManageLocations = ({ locations, setLocations }) => {
    const [newLocation, setNewLocation] = useState({ name: '', address: '', type: '', employees: '' });
    const [showForm, setShowForm] = useState(false);

    const handleAddLocation = () => {
        setLocations([...locations, { 
            location_id: locations.length + 1, 
            name: newLocation.name, 
            address: newLocation.address, 
            type: newLocation.type, 
            employees: newLocation.employees 
        }]);

        setNewLocation({ name: '', address: '', type: '', employees: '' });
        setShowForm(false);
    };

    const renderLocationItem = ({ item }) => (
        <View style={styles.locationItem}>
            <Text style={[styles.locationColumn, styles.locationNameColumn]}>{item.name}</Text>
            <Text style={[styles.locationColumn, styles.addressColumn]}>{item.address}</Text>
            <Text style={[styles.locationColumn, styles.typeColumn]}>{item.type}</Text>
            <Text style={[styles.locationColumn, styles.employeesColumn]}>{item.employees}</Text>
            <View style={styles.actionsColumn}>
                <TouchableOpacity onPress={() => editLocation(item.location_id)}>
                    <Text style={styles.actionButton}>Edit</Text>
                </TouchableOpacity>
                {locations.length > 1 && (
                    <TouchableOpacity onPress={() => deleteLocation(item.location_id)}>
                        <Text style={styles.actionButton}>Delete</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.locationsContainer}>
            <Text style={styles.title}>Manage Locations</Text>

            {/* Column Titles */}
            <View style={styles.columnTitles}>
                <Text style={[styles.columnTitle, styles.locationNameColumn]}>Location Name</Text>
                <Text style={[styles.columnTitle, styles.addressColumn]}>Address</Text>
                <Text style={[styles.columnTitle, styles.typeColumn]}>Type</Text>
                <Text style={[styles.columnTitle, styles.employeesColumn]}>Employees</Text>
                <Text style={[styles.columnTitle, styles.actionsColumn]}>Actions</Text>
            </View>

            {/* List of Locations */}
            <FlatList
                data={locations}
                renderItem={renderLocationItem}
                keyExtractor={item => item.location_id.toString()}
            />

            {/* Add Button */}
            <View style={styles.addButtonContainer}>
                <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addButton}>
                    <Ionicons name="add" size={30} color="white" />
                </TouchableOpacity>
            </View>

            {/* Modal for Adding Location */}
            <Modal
                transparent={true}
                visible={showForm}
                animationType="slide"
                onRequestClose={() => setShowForm(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Add New Location</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Location Name"
                            value={newLocation.name}
                            onChangeText={(text) => setNewLocation({ ...newLocation, name: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Address"
                            value={newLocation.address}
                            onChangeText={(text) => setNewLocation({ ...newLocation, address: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Type"
                            value={newLocation.type}
                            onChangeText={(text) => setNewLocation({ ...newLocation, type: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Employees"
                            value={newLocation.employees}
                            keyboardType="number-pad"
                            onChangeText={(text) => setNewLocation({ ...newLocation, employees: text })}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity onPress={handleAddLocation} style={styles.submitButton}>
                                <Text style={styles.submitButtonText}>Add Location</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowForm(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    locationsContainer: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    locationItem: {
        flexDirection: 'row',
        //justifyContent: 'center',
        paddingRight: 40,
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    columnTitles: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    columnTitle: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingHorizontal: 5,
    },
    locationColumn: {
        flex: 1,
        textAlign: 'center', // Center the content in each column
        borderWidth: 2,
        borderColor: 'red'
    },
    locationNameColumn: {
        width: 100, 
    },
    addressColumn: {
        width: 150, 
    },
    typeColumn: {
        width: 100, 
    },
    employeesColumn: {
        width: 30, 
        paddingRight: 20
    },
    actionsColumn: {
        width: 100, 
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        color: '#007BFF',
        //marginRight: 10,
    },
    addButtonContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    addButton: {
        backgroundColor: '#007BFF',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    formContainer: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 10,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingLeft: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    submitButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
    },
    submitButtonText: {
        color: 'white',
    },
    cancelButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    cancelButtonText: {
        color: 'white',
    },
});

export default ManageLocations;