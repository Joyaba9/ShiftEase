import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal} from 'react-native';

const { width } = Dimensions.get('window');

const AnnouncementsModal = ({ announcementsVisible, setAnnouncementsVisible, businessId }) => {
    const isMobile = width < 768;
    
    const [activeTab, setActiveTab] = useState('General');
    const [showAddForm, setShowAddForm] = useState(false); // State to control form visibility
    const [addAnnouncementTitle, setAddAnnouncementTitle] = useState(''); // State for the title
    const [addAnnouncementText, setAddAnnouncementText] = useState(''); // State for the textbox content

    //Hard-coded Test Content
    pulledBusinessAnnouncement = [];
    pulledGeneralAnnouncement = [
        { id: 1, Title: 'Test Announcement', Content: 'This announcement is used to test if the annoucements display' },
        { id: 2, Title: 'Test Announcement #2', Content: 'This one is just to make sure it can handle the multiple lines of text. This one is just to make sure it can handle the multiple lines of text.This one is just to make sure it can handle the multiple lines of text.This one is just to make sure it can handle the multiple lines of text.This one is just to make sure it can handle the multiple lines of text.This one is just to make sure it can handle the multiple lines of text. This one is just to make sure it can handle the multiple lines of text. This one is just to make sure it can handle the multiple lines of text. This one is just to make sure it can handle the multiple lines of text.This one is just to make sure it can handle the multiple lines of text. This one is just to make sure it can handle the multiple lines of text.' },
        { id: 3, Title: 'Test Announcement #3 | Scrolling', Content: 'This announcement is used to make sure that the window scrolls and has the intended format' },
        { id: 4, Title: 'Test Announcement #3 | Scrolling', Content: 'This announcement is used to make sure that the window scrolls and has the intended format' },
        { id: 5, Title: 'Test Announcement #3 | Scrolling', Content: 'This announcement is used to make sure that the window scrolls and has the intended format' },
        { id: 6, Title: 'Test Announcement #3 | Scrolling', Content: 'This announcement is used to make sure that the window scrolls and has the intended format' },
        { id: 7, Title: 'Test Announcement #3 | Scrolling', Content: 'This announcement is used to make sure that the window scrolls and has the intended format' },
    ];
      
    const renderTabContent = () => {
        switch (activeTab) {
            case 'General':
                return (
                    <>
                        <View>
                            {pulledGeneralAnnouncement.length === 0 ? (
                                <View>
                                    <Text style={styles.tabContent}>No notifications in the "General" box</Text>
                                </View>
                            ) : (
                                pulledGeneralAnnouncement.map((announcement) => (
                                    <View key={announcement.id} style={styles.announcementBox}>
                                        <Text style={styles.announcementTitle}>{announcement.Title}</Text>
                                        <View style={styles.HDivider}/>
                                        <Text style={styles.announcementContent}>{announcement.Content}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </>
                );
            case 'Business':
                return (
                    <>
                        <View>
                            {pulledBusinessAnnouncement.length === 0 ? (
                                <View>
                                    <Text style={styles.tabContent}>No notifications in the "Business" box</Text>
                                </View>
                            ) : (
                                pulledBusinessAnnouncement.map((announcement) => (
                                    <View key={announcement.id} style={styles.announcementBox}>
                                        <Text style={styles.announcementTitle}>{announcement.Title}</Text>
                                        <View style={styles.HDivider}/>
                                        <Text style={styles.announcementContent}>{announcement.Content}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </>
                );
            default:
                return null;
        }
    };

    const handleAddAnnouncementForm = () => {
        setShowAddForm(true);
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setAddAnnouncementTitle('');
        setAddAnnouncementText('');
    };

    const handleAdd = () => {
        console.log('Announcement Title:', addAnnouncementTitle);
        console.log('Announcement Text:', addAnnouncementText);
        setShowAddForm(false);
        setAddAnnouncementTitle('');
        setAddAnnouncementText('');
    };

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={announcementsVisible}
                onRequestClose={() => setAnnouncementsVisible(false)}
            >
                <View style={styles.screenGray}>
                    <View style={styles.announcementsContainer}>
                        <View style={styles.headerRow}>
                            <Text style={styles.containerHeader}>Announcements</Text>
                            {!showAddForm && (
                                <TouchableOpacity style={styles.headerBubbleButton} onPress={handleAddAnnouncementForm}>
                                    <Text style={styles.buttonText}>Add Announcements</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {showAddForm && (
                            <View style={styles.addFormContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Announcement Title"
                                    value={addAnnouncementTitle}
                                    onChangeText={setAddAnnouncementTitle}
                                />
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Announcement Text"
                                    value={addAnnouncementText}
                                    onChangeText={setAddAnnouncementText}
                                    multiline
                                />
                                <View style={styles.buttonRowContainer}>
                                    <TouchableOpacity style={styles.bubbleButton} onPress={handleAdd}>
                                        <Text style={styles.buttonText}>Add</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.bubbleButton} onPress={handleCancel}>
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity 
                                style={[styles.tabButton, activeTab === 'General' && styles.activeTab]} 
                                onPress={() => setActiveTab('General')}
                            >
                                <Text style={styles.tabText}>General</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.tabButton, activeTab === 'Business' && styles.activeTab]} 
                                onPress={() => setActiveTab('Business')}
                            >
                                <Text style={styles.tabText}>Business</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.HDivider}/>

                        <ScrollView contentContainerStyle={styles.scrollContainer}>
                            <View style={styles.contentContainer}>
                                {renderTabContent()}
                            </View>
                        </ScrollView>

                        <View style={styles.HDivider}/>
                        <View style={styles.buttonRowContainer}>
                            <TouchableOpacity style={styles.bubbleButton} onPress={() => setAnnouncementsVisible(false)}>
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
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
    announcementsContainer: {
        width: '95%',
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
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
    },
    containerHeader: {
        fontSize: 40,
        paddingHorizontal: 20,
        paddingTop: 15,
        fontWeight: '400',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    headerBubbleButton: {
        borderRadius: 50,
        backgroundColor: '#9FCCF5',
        width: 215,
        maxWidth: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 3.5,
    },
    buttonText: {
        fontSize: 18,
        color: '#333',
    },
    bubbleButton: {
        borderRadius: 50,
        backgroundColor: '#9FCCF5',
        width: 100,
        maxWidth: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        paddingHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 3.5,
    },
    buttonRowContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 10,
        paddingBottom: 30,
        top: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: '#eee',
        marginHorizontal: 5,
    },
    activeTab: {
        backgroundColor: '#DDF1FA',
    },
    tabText: {
        color: '#333',
        fontWeight: '500',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContent: {
        fontSize: 16,
        color: '#333',
    },
    HDivider: {
        borderBottomColor: 'lightgray',
        borderBottomWidth: 2,
        width: '99%',
        alignSelf: 'center',
    },
    addFormContainer: {
        width: '100%',
        marginVertical: 20,
        paddingHorizontal: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 10,
    },
    announcementBox: {
        flexGrow: 1,
        backgroundColor: '#f2f0ef',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginVertical: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    announcementTitle: {
        fontSize: 30,
        fontWeight: 400,
        padding: 10,
    },
    announcementContent: {
        fontSize: 16,
        padding: 10,
        paddingBottom: 20,
    },
});

export default AnnouncementsModal;
