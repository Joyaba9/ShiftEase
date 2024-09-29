import { client, connectToDatabase } from './Gcloud.js';
import bcrypt from 'bcrypt';


// the following function is to register a new business in the database and is just temporary for testing purposes

// Function to register a new business will connect to the front end


// Function to register a new business
const registerBusiness = async (businessName, businessEmail, password) => {
  console.log('Starting registerBusiness function'); // to help debug 

  // try block

  try {
    // Connect to the database
    await connectToDatabase(); // mnakes sure that the database connection is established

    // Generate a random 6-digit business_id
    // actual table has auto-incrementing business_id but for now just to test the function
    const businessId = Math.floor(100000 + Math.random() * 900000);
    console.log(`Generated businessId: ${businessId}`);
    

    // Hash the password to make sure its secure
    const saltRounds = 10;
    console.log('Hashing the password...');
    const passHash = await bcrypt.hash(password, saltRounds);
    console.log(`Password hashed successfully: ${passHash}`);


    // Insert the new business into the database
    // created_at, Updated_at are set to NOW() to get the current timestamp. Need to add a funtion after to update the timestamp for updated_at.
    const query = `INSERT INTO business (business_id, business_name, business_email, pass_hash, created_at, updated_at) 
                   VALUES ($1, $2, $3, $4, NOW(), NOW())`;
    console.log('Preparing query:', query);

    // Execute the query

    const result = await client.query(query, [businessId, businessName, businessEmail, passHash]);
    console.log(`Business registered successfully with ID: ${businessId}`);
    console.log('Query result:', result);

    // Close the connection once the query is complete
    console.log('Closing the database connection...');
    await client.end();
    console.log('Database connection is now closed successfully');
  } catch (err) {
    console.error('Error during registration process:', err);
  }
};

// Test the registration
console.log('Calling registerBusiness function...');
registerBusiness('Test Business', 'test@business.com', 'securepassword'); // this can be changed to take in user input from the front end
