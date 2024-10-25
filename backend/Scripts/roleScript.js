import getClient from '../db//dbClient.js';

//#region Create Role

/**
 * Creates a new role within the database.
 *
 * @param {string} roleName - The name of the role to be created (e.g., "Manager", "Employee").
 * @returns {Promise<void>} - A promise indicating the role creation success or failure.
 */
export async function CreateRole(roleName) {
    const client = await getClient(); // Initialize the database client
    console.log('Database Client Obtained');

    await client.connect(); // Establish connection with the database
    console.log('Connected to Database');

    // SQL query to insert a new role into the roles table
    const query = `INSERT INTO roles (role_name) VALUES ($1) RETURNING role_id`;

    try {
        const res = await client.query(query, [roleName]); // Execute query to insert the role
        console.log('Query Executed');
        
        // Confirm successful insertion of the new role
        if (res.rowCount > 0) {
            console.log(`Role ID ${res.rows[0].role_id} created successfully`);
        } else {
            throw new Error('Role not created'); // Handle failure to create a role
        }
    } catch (err) {
        console.error('Error executing query:', err); // Log any errors
        throw err; // Rethrow error for higher-level handling
    } finally {
        await client.end(); // Ensure database connection is closed
        console.log('Database connection closed');
    }
}

//#endregion

//#region Create Role With Permissions

/**
 * Creates a new role, assigns permissions, and sets manager status.
 *
 * @param {number} businessId - The ID of the business.
 * @param {string} roleName - The name of the role to be created.
 * @param {Array<number>} permissions - Array of permission IDs to be assigned to the role.
 * @param {boolean} isManager - Indicates if the role is a manager role.
 * @returns {Promise<Object>} - Created role details with permissions and manager status.
 */
export async function CreateRoleWithPermissions(businessId, roleName, permissions, isManager) {
    const client = await getClient();
    await client.connect();

    try {
        // Begin transaction
        await client.query('BEGIN');

        // Insert new role into the roles table with the is_manager flag
        const roleInsertQuery = `
            INSERT INTO roles (role_name, business_id, is_manager)
            VALUES ($1, $2, $3)
            RETURNING role_id;
        `;
        const roleRes = await client.query(roleInsertQuery, [roleName, businessId, isManager]);
        const roleId = roleRes.rows[0].role_id;

        // If permissions are provided, insert them
        if (permissions.length > 0) {
            const rolePermissionsQuery = `
                INSERT INTO role_permissions (role_id, permission_id)
                VALUES ($1, $2);
            `;

            // Assign each permission from the permissions array
            for (const permissionId of permissions) {
                await client.query(rolePermissionsQuery, [roleId, permissionId]);
            }
        }

        // Commit transaction
        await client.query('COMMIT');

        return {
            success: true,
            roleId,
            roleName,
            isManager,
            permissions: permissions.length > 0 ? permissions : 'No permissions assigned'
        };
    } catch (err) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error creating role with permissions:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion

//#region Update Role With Permissions

/**
 * Updates an existing role, its permissions, and manager status.
 * Prevents updates to default roles (IDs 1-3) and checks to make sure the role is associated with the specified business.
 *
 * @param {number} businessId - The ID of the business.
 * @param {number} roleId - The ID of the role to be updated.
 * @param {string} roleName - The new name of the role.
 * @param {Array<number>} permissions - The new set of permissions for the role.
 * @param {boolean} isManager - The updated manager status of the role.
 * @returns {Promise<Object>} - Updated role details with permissions or error.
 */
export async function UpdateRoleWithPermissions(businessId, roleId, roleName, permissions, isManager) {
    // Prevent updating default roles (IDs 1, 2, 3)
    if ([1, 2, 3].includes(roleId)) {
        throw new Error('Default roles cannot be edited.');
    }

    const client = await getClient();
    await client.connect();

    try {
        // Check if the role is associated with the specified business ID
        const roleCheckQuery = `
            SELECT role_id FROM roles
            WHERE role_id = $1 AND business_id = $2;
        `;
        const roleCheckRes = await client.query(roleCheckQuery, [roleId, businessId]);
        if (roleCheckRes.rows.length === 0) {
            throw new Error('Role not associated with the specified business ID.');
        }

        // Begin transaction
        await client.query('BEGIN');

        // Update the role's name and is_manager flag
        const roleUpdateQuery = `
            UPDATE roles
            SET role_name = $1, is_manager = $2
            WHERE role_id = $3 AND business_id = $4;
        `;
        await client.query(roleUpdateQuery, [roleName, isManager, roleId, businessId]);

        // Fetch current permissions for the role
        const currentPermissionsRes = await client.query(
            'SELECT permission_id FROM role_permissions WHERE role_id = $1;',
            [roleId]
        );
        const currentPermissions = currentPermissionsRes.rows.map(row => row.permission_id);

        // Determine permissions to add and remove
        const permissionsToAdd = permissions.filter(p => !currentPermissions.includes(p));
        const permissionsToRemove = currentPermissions.filter(p => !permissions.includes(p));

        // Add new permissions
        if (permissionsToAdd.length > 0) {
            const addPermissionQuery = `
                INSERT INTO role_permissions (role_id, permission_id)
                VALUES ($1, $2);
            `;
            for (const permissionId of permissionsToAdd) {
                await client.query(addPermissionQuery, [roleId, permissionId]);
            }
        }

        // Remove old permissions
        if (permissionsToRemove.length > 0) {
            const removePermissionQuery = `
                DELETE FROM role_permissions
                WHERE role_id = $1 AND permission_id = $2;
            `;
            for (const permissionId of permissionsToRemove) {
                await client.query(removePermissionQuery, [roleId, permissionId]);
            }
        }

        // Commit transaction
        await client.query('COMMIT');

        return {
            success: true,
            roleId,
            roleName,
            isManager,
            permissions: {
                added: permissionsToAdd,
                removed: permissionsToRemove,
                current: permissions
            }
        };
    } catch (err) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error updating role with permissions:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion

//#region Get Roles By Business ID

/**
 * Retrieves roles based on business ID and optional manager status.
 *
 * @param {number} businessId - The ID of the business.
 * @param {boolean|null} isManager - Filter roles based on manager status.
 *                                   Set to true to return only manager roles,
 *                                   false for non-manager roles, or null for all roles.
 * @returns {Promise<Array>} - List of role IDs and names matching the criteria.
 */
export async function GetRolesByBusinessAndManagerStatus(businessId, isManager = null) {
    const client = await getClient();
    await client.connect();

    try {
        // Base query to retrieve roles by business ID (or global roles with business_id of 0)
        let query = `
            SELECT role_id, role_name, is_manager
            FROM roles
            WHERE (business_id = $1 OR business_id = 0)
        `;
        const queryParams = [businessId];

        // Add condition for manager status if specified
        if (isManager !== null) {
            query += ' AND is_manager = $2';
            queryParams.push(isManager);
        }

        // Execute the query
        const res = await client.query(query, queryParams);
        return res.rows;
    } catch (err) {
        console.error('Error retrieving roles:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion

//#region Get All Permissions

/**
 * Retrieves all permissions from the database.
 *
 * @returns {Promise<Array>} - List of all permissions with their ids and names.
 */
export async function GetAllPermissions() {
    const client = await getClient();
    await client.connect();

    try {
        // Query to get all permissions
        const getPermissionsQuery = `
            SELECT permission_id, permission_name
            FROM permissions;
        `;

        const result = await client.query(getPermissionsQuery);
        return result.rows;
    } catch (err) {
        console.error('Error retrieving permissions:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion

//#region Get Role Permissions

/**
 * Retrieves all permissions for a given role, ensuring the role is associated 
 * with the specified business ID or has a business ID of 0.
 *
 * @param {number} businessId - The ID of the business.
 * @param {number} roleId - The ID of the role.
 * @returns {Promise<Array>} - List of permissions associated with the role.
 */
export async function GetRolePermissions(businessId, roleId) {
    const client = await getClient();
    await client.connect();

    try {
        // Check if the role is associated with the specified business ID or has a business ID of 0
        const roleCheckQuery = `
            SELECT role_id
            FROM roles
            WHERE role_id = $1 AND (business_id = $2 OR business_id = 0);
        `;
        const roleCheckRes = await client.query(roleCheckQuery, [roleId, businessId]);

        if (roleCheckRes.rows.length === 0) {
            throw new Error('Role not found or not associated with the specified business ID.');
        }

        // Query to get all permissions associated with the role
        const getPermissionsQuery = `
            SELECT p.permission_id, p.permission_name
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE rp.role_id = $1;
        `;
        
        const result = await client.query(getPermissionsQuery, [roleId]);
        return result.rows;
    } catch (err) {
        console.error('Error retrieving role permissions:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion