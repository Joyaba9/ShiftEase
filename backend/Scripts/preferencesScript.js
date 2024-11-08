import getClient from '../db/dbClient.js';

// Fetch preferences for a specific business
export async function fetchPreferences(business_id) {
    const client = await getClient();
    await client.connect();

    try {
        // Get all preferences
        const preferencesQuery = `
            SELECT p.preference_id, p.preference_description, bp.number
            FROM preferences p
            LEFT JOIN business_preferences bp
            ON p.preference_id = bp.preference_id AND bp.business_id = $1
        `;
        const result = await client.query(preferencesQuery, [business_id]);

        return result.rows.map(row => ({
            preference_id: row.preference_id,
            description: row.preference_description,
            enabled: row.number !== null, // Toggle is enabled if a row exists in business_preferences
            number: row.number // Dropdown value if applicable
        }));
    } catch (error) {
        console.error('Error fetching preferences:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// Update preferences for a specific business
export async function updatePreferences(businessId, toggles, dropdowns) {
    const client = await getClient();
    await client.connect();
  
    try {
      await client.query('BEGIN'); // Start a transaction
  
      // Step 1: Delete existing preferences for the business
      await client.query('DELETE FROM business_preferences WHERE business_id = $1', [businessId]);
  
      // Step 2: Insert updated toggles (only if they are enabled)
      for (const preferenceId of toggles) {
        await client.query(
          `INSERT INTO business_preferences (preference_id, business_id) VALUES ($1, $2)`,
          [preferenceId, businessId]
        );
      }
  
      // Step 3: Insert updated dropdowns with values
      for (const { preference_id, number } of dropdowns) {
        await client.query(
          `INSERT INTO business_preferences (preference_id, business_id, number) VALUES ($1, $2, $3)`,
          [preference_id, businessId, number]
        );
      }
  
      await client.query('COMMIT'); // Commit transaction
  
      return { success: true, message: 'Preferences updated successfully.' };
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback on error
      console.error('Error updating preferences:', error);
      throw error;
    } finally {
      await client.end(); // Close connection
    }
  }
