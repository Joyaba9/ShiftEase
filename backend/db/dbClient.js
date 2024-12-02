import { Connector } from '@google-cloud/cloud-sql-connector';
import dotenv from 'dotenv';
import pkg from 'pg';

const { Client } = pkg;

dotenv.config();

const connector = new Connector();

async function getClient() {
    console.log('Getting database client...');

    const connectionOptions = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: 'localhost',
    };

    const client = new Client({
        ...connectionOptions,
        ...await connector.getOptions({
            instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        }),
        // Disable SSL
        ssl: false,
    });

    console.log('Database client created');
    return client;
}

export default getClient;