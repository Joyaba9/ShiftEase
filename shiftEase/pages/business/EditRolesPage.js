import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import NavBar from '../../components/NavBar';

const EditRolesPage = () => {
  const loggedInUser = useSelector((state) => state.business.businessInfo); // Get logged-in user's business info
  const businessId = loggedInUser?.business?.business_id; // Extract businessId dynamically
  
  const [roles, setRoles] = useState([]);
  const [permissionsList, setPermissionsList] = useState([]);
  const [editedRole, setEditedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isManagerChecked, setIsManagerChecked] = useState(false);
  const [newRoleIsManager, setNewRoleIsManager] = useState(false);

  // Fetch permissions and roles when the component mounts
  useEffect(() => {
    fetchPermissions();
    fetchRoles();
  }, []);

  // Fetch all permissions from the server
  const fetchPermissions = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/role/getPermissions');
      if (!response.ok) throw new Error('Failed to fetch permissions');

      const data = await response.json();
      setPermissionsList(data.permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      Alert.alert('Error', 'Failed to load permissions.');
    }
  };


  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5050/api/role/getBusinessRoles?businessId=${businessId}&roleType=all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Failed to fetch roles');
  
      const data = await response.json();
      console.log('Fetched roles:', data);
      setRoles(data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      Alert.alert('Error', 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = async (role) => {
    try {
      const response = await fetch(`http://localhost:5050/api/role/getRolePermissions?businessId=${businessId}&roleId=${role.role_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Failed to fetch role permissions');
  
      const data = await response.json();
      const rolePermissions = data.permissions.map((perm) => perm.permission_name);
  
      setEditedRole({
        ...role,
        permissions: rolePermissions || [],
        is_manager: role.is_manager, // Set initial manager status
      });
  
      setIsManagerChecked(role.is_manager || false); // Set toggle state based on is_manager
      setIsEditing(true);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      Alert.alert('Error', 'Failed to load role permissions.');
    }
  };

  // Helper function to confirm deletion
  const confirmDeletion = (callback) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this role?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: callback },
      ],
      { cancelable: true }
    );
  };
  
  // handleDelete function
  const handleDelete = async (roleId) => {
    console.log('Attempting to delete role with ID:', roleId);
  
    try {
      console.log('Preparing to send DELETE request...');
      
      // Make the DELETE request
      const response = await fetch(`http://localhost:5050/api/role/deleteRole?roleId=${roleId}&businessId=${businessId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Request sent, waiting for response...');
  
      // Check if the request succeeded
      if (!response.ok) {
        const data = await response.json();
        console.error('Failed to delete role:', data.message || response.statusText);
        throw new Error(data.message || 'Failed to delete role');
      }
  
      // Parse response data
      const data = await response.json();
      console.log('Response data:', data);
  
      // Handle successful deletion
      if (data.success) {
        console.log('Role deleted successfully.');
        Alert.alert('Success', 'Role deleted successfully.');
        setRoles(roles.filter((role) => role.role_id !== roleId)); // Update the UI
      } else {
        console.log('Deletion error:', data.message);
        Alert.alert('Error', data.message || 'Failed to delete role.');
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      Alert.alert('Error', error.message || 'Failed to delete role.');
    }
  };
  
  const handlePermissionChange = (permissionName, value) => {
    setEditedRole((prevRole) => {
      const newPermissions = value
        ? [...prevRole.permissions, permissionName] // Add permission if "Yes" is selected
        : prevRole.permissions.filter((perm) => perm !== permissionName); // Remove if "No" is selected
  
      return {
        ...prevRole,
        permissions: newPermissions,
      };
    });
  };
  
  const handleSave = async () => {
    if (!editedRole) return;
  
    const { role_id, role_name, permissions } = editedRole;
  
    // Map permission names to IDs
    const permissionIds = permissionsList
      .filter((perm) => permissions.includes(perm.permission_name))
      .map((perm) => perm.permission_id);
  
    const payload = {
      businessId: businessId,
      roleId: role_id,
      roleName: role_name,
      permissions: permissionIds,
      isManager: isManagerChecked, // Include manager flag
    };
  
    console.log('Updating role with payload:', payload); // Debug log
  
    try {
      const response = await fetch('http://localhost:5050/api/role/updateRoleWithPermissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) throw new Error('Failed to update role');
  
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Role updated successfully.');
        fetchRoles(); // Refresh roles after successful update
        setIsEditing(false); // Close the modal
      } else {
        throw new Error(data.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      Alert.alert('Error', 'Failed to update role.');
    }
  };
  
    // Add or remove permissions for the new role
    const handleNewRolePermissionChange = (permission) => {
      setNewRolePermissions((prevPermissions) =>
        prevPermissions.includes(permission)
          ? prevPermissions.filter((p) => p !== permission) // Remove if exists
          : [...prevPermissions, permission] // Add if not present
      );
    };
    
    // Save the new role
    const saveNewRole = async () => {
      if (!newRoleName.trim()) {
        Alert.alert('Error', 'Please enter a valid role name.');
        return;
      }

      // Map selected permissions to IDs
      const selectedPermissionIds = permissionsList
        .filter((perm) => newRolePermissions.includes(perm.permission_name))
        .map((perm) => perm.permission_id);

      const payload = {
        businessId: businessId,
        roleName: newRoleName.trim(),
        permissions: selectedPermissionIds,
        isManager: newRoleIsManager,  // Include manager status
      };

      try {
        const response = await fetch('http://localhost:5050/api/role/createRoleWithPermissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to create role');

        const data = await response.json();
        if (data.success) {
          Alert.alert('Success', 'New role created successfully.');
          fetchRoles(); // Refresh roles after successful creation
          setNewRoleName('');
          setNewRolePermissions([]);
          setNewRoleIsManager(false); // Reset manager status
          setIsCreating(false); // Close the modal
        } else {
          throw new Error(data.message || 'Failed to create role');
        }
      } catch (error) {
        console.error('Error creating role:', error);
        Alert.alert('Error', 'Failed to create role.');
      }
    };

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <NavBar homeRoute={'Business'} />
    
          <View style={styles.rolesContainer}>
          <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>Manage Roles</Text>
          <TouchableOpacity onPress={() => setIsCreating(true)} style={styles.createButton}>
            <Text style={styles.buttonText}>Create New Role</Text>
          </TouchableOpacity>
        </View>
    
        {loading ? (
          <Text>Loading roles...</Text>
        ) : (
          <View style={styles.roleList}>
            {roles && roles.length === 0 ? (
              <Text>No roles found.</Text>
            ) : (
              roles?.map((role, index) => (
                // Ensure role is defined before accessing its properties
                role ? (
                  <View key={role.role_id || index} style={styles.roleRow}>
                    <Text style={styles.roleName}>{role.role_name || 'Unnamed Role'}</Text>
                    <View style={styles.roleActions}>
                      <TouchableOpacity onPress={() => openEditForm(role)} style={styles.editButton}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(role.role_id)} style={styles.deleteButton}>
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null
              ))
            )}
          </View>
        )}

    
            {/* Edit Role Modal */}
            {isEditing && editedRole && (
            <View style={styles.editForm}>
              <Text style={styles.editTitle}>Edit Permissions for {editedRole.role_name}</Text>

              {/* Manager Toggle */}
              <View style={styles.managerToggleContainer}>
                <Text>Is Manager:</Text>
                <Switch
                  value={isManagerChecked}
                  onValueChange={(value) => {
                    setIsManagerChecked(value);
                    setEditedRole((prevRole) => ({
                      ...prevRole,
                      is_manager: value,
                    }));
                  }}
                />
              </View>

              <ScrollView style={styles.permissionsScroll}>
                <Text>Select Permissions:</Text>
                {permissionsList.map((permission, index) => (
                  <View key={permission.permission_id || index} style={styles.permissionRow}>
                    <Text>{permission.permission_name}</Text>
                    <Picker
                      selectedValue={editedRole.permissions.includes(permission.permission_name) ? "Yes" : "No"}
                      onValueChange={(value) => handlePermissionChange(permission.permission_name, value === "Yes")}
                      style={styles.picker}
                    >
                      <Picker.Item label="Yes" value="Yes" />
                      <Picker.Item label="No" value="No" />
                    </Picker>
                  </View>
                ))}
              </ScrollView>

              <Button title="Save Changes" onPress={handleSave} />
              <Button title="Cancel" color="gray" onPress={() => setIsEditing(false)} />
            </View>
          )}
    
            {/* Create New Role Modal */}
            <Modal visible={isCreating} animationType="slide" transparent={true}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Create New Role</Text>

                  {/* Input for the role name */}
                  <TextInput
                    placeholder="Role Name"
                    value={newRoleName}
                    onChangeText={setNewRoleName}
                    style={styles.input}
                  />

                  {/* Manager toggle */}
                  <View style={styles.permissionRow}>
                    <Text>Set as Manager</Text>
                    <Switch
                      value={newRoleIsManager}
                      onValueChange={(value) => setNewRoleIsManager(value)}
                    />
                  </View>

                  {/* Permissions list */}
                  <Text>Select Permissions:</Text>
                  <ScrollView style={styles.permissionsList}>
                    {permissionsList.map((permission, index) => (
                      <View key={permission.permission_id || index} style={styles.permissionRow}>
                        <Text>{permission.permission_name}</Text>
                        <TouchableOpacity
                          onPress={() => handleNewRolePermissionChange(permission.permission_name)}
                          style={[
                            styles.permissionButton,
                            newRolePermissions.includes(permission.permission_name) && styles.selectedPermissionButton,
                          ]}
                        >
                          <Text style={styles.permissionButtonText}>
                            {newRolePermissions.includes(permission.permission_name) ? 'Remove' : 'Add'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>

                  {/* Save and Cancel Buttons */}
                  <View style={styles.modalButtons}>
                    <Button title="Save Role" onPress={saveNewRole} />
                    <Button title="Cancel" color="gray" onPress={() => setIsCreating(false)} />
                  </View>
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
  editForm: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: '80%', // Constrain max height to make scrolling visible
  },
  permissionsScroll: {
    maxHeight: 300, // Adjust height as needed
    marginVertical: 10,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  managerToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between', // Align toggle with label
  },
});

export default EditRolesPage;
