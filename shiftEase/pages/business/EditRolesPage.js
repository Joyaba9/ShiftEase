import React, { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import NavBar from '../../components/NavBar';

const EditRolesPage = () => {
  const [roles, setRoles] = useState([
    { id: 1, name: 'Manager', permissions: ['View', 'Edit'] },
    { id: 2, name: 'Employee', permissions: ['View'] },
  ]);
  
  const [permissionsList] = useState(['View', 'Edit', 'Delete', 'Manage Schedules']); // Mocked permissions
  const [editedRole, setEditedRole] = useState(null); // The role being edited
  const [isEditing, setIsEditing] = useState(false); // To toggle the edit form
  const [isCreating, setIsCreating] = useState(false); // For creating new role modal
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState([]);


  const openEditForm = (role) => {
    setEditedRole(role);
    setIsEditing(true);
  };

  const handleDelete = (roleId) => {
    // Implement delete functionality here (for now just alert)
    Alert.alert('Delete Role', 'Role deleted successfully.');
    setRoles(roles.filter((role) => role.id !== roleId));
  };

  const handlePermissionChange = (permission) => {
    // Add or remove permissions from the role
    if (editedRole.permissions.includes(permission)) {
      setEditedRole({
        ...editedRole,
        permissions: editedRole.permissions.filter((p) => p !== permission),
      });
    } else {
      setEditedRole({
        ...editedRole,
        permissions: [...editedRole.permissions, permission],
      });
    }
  };

  const handleSave = () => {
    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.id === editedRole.id ? { ...role, permissions: editedRole.permissions } : role
      )
    );
    Alert.alert('Success', 'Role permissions updated.');
    setIsEditing(false); // Close the edit form
    setEditedRole(null); // Clear the edited role
  };

    // Add or remove permissions for the new role
    const handleNewRolePermissionChange = (permission) => {
      setNewRolePermissions((prevPermissions) =>
        prevPermissions.includes(permission)
          ? prevPermissions.filter((p) => p !== permission)
          : [...prevPermissions, permission]
      );
    };
  
    // Save the new role
    const saveNewRole = () => {
      if (!newRoleName) {
        Alert.alert('Error', 'Please enter a role name.');
        return;
      }
      setRoles([...roles, { id: roles.length + 1, name: newRoleName, permissions: newRolePermissions }]);
      setNewRoleName('');
      setNewRolePermissions([]);
      setIsCreating(false);
      Alert.alert('Success', 'New role created successfully.');
    };

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <NavBar homeRoute={'Business'}/>
  
          <View style={styles.rolesContainer}>
            <View style={styles.headerContainer}>
            <Text style={styles.sectionTitle}>Manage Roles</Text>
            <TouchableOpacity
            onPress={() => setIsCreating(true)}
            style={styles.createButton}
            >
            <Text style={styles.buttonText}>Create Special Role</Text>
            </TouchableOpacity>
            </View>
  
            {/* Role List */}
            <View style={styles.roleList}>
              {roles.length === 0 ? (
                <Text>No roles found.</Text>
              ) : (
                roles.map((role) => (
                  <View key={role.id} style={styles.roleRow}>
                    <Text style={styles.roleName}>{role.name}</Text>
                    <View style={styles.roleActions}>
                      <TouchableOpacity onPress={() => openEditForm(role)} style={styles.editButton}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(role.id)} style={styles.deleteButton}>
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
  
            {/* Edit Role Permissions */}
            {isEditing && editedRole && (
              <View style={styles.editForm}>
                <Text style={styles.editTitle}>Edit Permissions for {editedRole.name}</Text>
                <Text>Select Permissions:</Text>
                {permissionsList.map((permission) => (
                  <View key={permission} style={styles.permissionRow}>
                    <Text>{permission}</Text>
                    <Picker
                      selectedValue={editedRole.permissions.includes(permission)}
                      onValueChange={() => handlePermissionChange(permission)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Yes" value={true} />
                      <Picker.Item label="No" value={false} />
                    </Picker>
                  </View>
                ))}
                <Button title="Save Changes" onPress={handleSave} />
                <Button title="Cancel" color="gray" onPress={() => setIsEditing(false)} />
              </View>
            )}
  
            {/* Create New Role Modal */}
            <Modal visible={isCreating} animationType="slide" transparent={true}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Create New Role</Text>
                  <TextInput
                    placeholder="Role Name"
                    value={newRoleName}
                    onChangeText={setNewRoleName}
                    style={styles.input}
                  />
                  <Text>Select Permissions:</Text>
                  {permissionsList.map((permission) => (
                    <View key={permission} style={styles.permissionRow}>
                      <Text>{permission}</Text>
                      <TouchableOpacity
                        onPress={() => handleNewRolePermissionChange(permission)}
                        style={[
                          styles.permissionButton,
                          newRolePermissions.includes(permission) && styles.selectedPermissionButton,
                        ]}
                      >
                        <Text style={styles.permissionButtonText}>
                          {newRolePermissions.includes(permission) ? 'Remove' : 'Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <Button title="Save Role" onPress={saveNewRole} />
                  <Button title="Cancel" color="gray" onPress={() => setIsCreating(false)} />
                </View>
              </View>
            </Modal>
          </View>
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
  },
  rolesContainer: {
    borderRadius: 10,
    padding: 20,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
    width: '90%',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roleList: {
    marginBottom: 20,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editForm: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  picker: {
    width: 120,
    height: 40,
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space between title and button
    alignItems: 'center',            // Center aligns items vertically
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  permissionsList: {
    maxHeight: 150, // Limits scrollable area
    marginBottom: 10,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  permissionButton: {
    backgroundColor: '#007BFF',
    padding: 5,
    borderRadius: 5,
  },
  selectedPermissionButton: {
    backgroundColor: '#4CAF50',
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EditRolesPage;
