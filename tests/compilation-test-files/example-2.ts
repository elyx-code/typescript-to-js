import { Client } from 'pg';

export async function createDatabase(config: {
	username: string;
	password: string;
	host: string;
	port: number;
	database: string;
}) {
	let client;
	try {
		const options = {
			...config,
			dialect: 'postgres' as 'postgres',
		};

		console.log('Connecting to Postgres server');

		const connectionOptions = {
			user: options.username,
			password: options.password,
			host: options.host,
			database: 'postgres',
			port: options.port,
			ssl: {
				rejectUnauthorized: false, // Set to true to validate SSL certificates
			},
		};

		client = new Client(connectionOptions);
		await client.connect();
		console.log('Successfully connected to Postgres server');

		await client.query(`CREATE DATABASE "${config.database}";`);
		console.log(`New database created "${config.database}"`);
	} catch (error: any) {
		// Database already exists
		if (error.code === '42P04') {
			console.log(
				`Database "${config.database}" already exists. Database creation was skipped`
			);
			// Do nothing
			return;
		}

		throw error;
	} finally {
		console.log('Closing Postgres server connection...');
		await client?.end();
		console.log('Postgress server connection successfully closed');
	}
}
