import { Storage } from '@google-cloud/storage';
import getClient from '../db/dbClient.js';
import dotenv from 'dotenv';
import fs from 'fs';
import fsp from 'fs/promises';
import mime from 'mime';

dotenv.config();

// Google Cloud Storage configuration
const bucketName = process.env.GCP_BUCKET_NAME;
const storage = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

/**
 * Function to add a profile photo for an employee.
 * 
 * @param {number} empId
 * @param {string} localFilePath - The local file path of the photo.
 * @param {string} originalName - The original file name of the photo.
 * @returns {Promise<object>} - The updated employee object with the new profile image URL.
 */
export async function addEmployeePhoto(empId, localFilePath, originalName) {
    console.log(`Starting addEmployeePhoto for emp_id: ${empId}`);
    console.log(`Local file path: ${localFilePath}`);
    console.log(`Original file name: ${originalName}`);

    
    const fileName = `profile_images/employee_${empId}-${Date.now()}-${originalName}`;
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    let client;

    try {
        // Confirm the file exists and is not empty, fs promise is used to confirm information.
        const fileStats = await fsp.stat(localFilePath);
        console.log(`Local file size before upload: ${fileStats.size} bytes`);
        if (fileStats.size === 0) {
            throw new Error('Local file is empty! File was not properly saved before upload.');
        }

        // Detect MIME type using the mime library
        const contentType = mime.getType(localFilePath) || 'application/octet-stream';
        console.log(`Detected MIME type: ${contentType}`);

        // Using MIME type to make sure the image is a proper image file.
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(contentType)) {
            throw new Error(`Invalid file type: ${contentType}. Only PNG, JPG, and JPEG are supported.`);
        }

        // Upload the file to Google Cloud Storage using a stream
        console.log(`Uploading file to Google Cloud Storage with content type: ${contentType}`);
        await new Promise((resolve, reject) => {
            fs.createReadStream(localFilePath) // Correct use of fs.createReadStream
                .pipe(
                    file.createWriteStream({
                        resumable: false,
                        gzip: true,
                        metadata: {
                            contentType,
                        },
                    })
                )
                .on('error', reject)
                .on('finish', resolve);
        });

        console.log('File upload to Google Cloud Storage completed.');
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        console.log(`Public URL: ${publicUrl}`);

        // Get database client and connect
        client = await getClient();
        await client.connect();
        console.log('Database connection established.');

        // Final update on the employees table itself
        const updateQuery = `
            UPDATE employees
            SET profile_image_url = $1
            WHERE emp_id = $2
            RETURNING emp_id, f_name, l_name, profile_image_url;
        `;
        const result = await client.query(updateQuery, [publicUrl, empId]);

        if (result.rowCount === 0) {
            throw new Error(`Employee with emp_id ${empId} not found.`);
        }

        console.log(`Profile photo updated for emp_id: ${empId}`);
        return result.rows[0];
    } catch (error) {
        console.error('Error in addEmployeePhoto:', error);
        throw error;
    } finally {
        if (client) {
            await client.end();
            console.log('Database connection closed.');
        }
    }
}

/**
 * Retrieves the profile photo URL for an employee.
 * 
 * @param {number} empId
 * @returns {string} The profile photo URL (on Google Cloud Bucket).
 * @throws Will throw an error if the employee is not found or there are database issues.
 */
export async function getEmployeePhoto(empId) {
  console.log(`Fetching profile photo for emp_id: ${empId}`);

  let client;

  try {
      client = await getClient();
      await client.connect();
      console.log('Database connection established.');

      const query = `
          SELECT profile_image_url
          FROM employees
          WHERE emp_id = $1;
      `;
      const result = await client.query(query, [empId]);

      if (result.rows.length === 0) {
          throw new Error(`Employee with emp_id ${empId} not found.`);
      }

      const profilePhotoUrl = result.rows[0].profile_image_url;
      console.log(`Retrieved profile photo URL: ${profilePhotoUrl}`);

      return profilePhotoUrl;
  } catch (error) {
      console.error('Error in getEmployeePhoto:', error);
      throw error;
  } finally {
      if (client) {
          await client.end();
          console.log('Database connection closed.');
      }
  }
}