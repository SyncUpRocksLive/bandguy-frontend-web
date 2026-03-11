import express, { Express } from 'express';
import { readFile } from 'fs';
import { useChannels, channels } from './controller-channels'
import { useMessages, message_queue } from './controller-message'
import { useSets } from './controller-sets';
import { requireAuth, useLogin } from './controller-login';
var cookieParser = require('cookie-parser')

const PORT: number = parseInt(process.env.PORT || '9000', 10);

// Use a secret for signing cookies
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'localsecret';
if (COOKIE_SECRET === 'localsecret' && process.env.NODE_ENV === 'production') {
	console.warn("WARNING: Using default cookie secret in production! This is not secure. Please set the COOKIE_SECRET environment variable to a strong, unique value.");
}

const app: Express = express();

app.set('trust proxy', 1);

// Limits all JSON bodies to 10kb
app.use(express.json({ limit: '10kb' }));

// Protect against tampering
app.use(cookieParser(COOKIE_SECRET));

app.get('/', (req, res) => {
    //res.send({ channels: channels, message_queue: message_queue });
	res.status(200).send('OK');
});
// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).send('OK');
});

useLogin(app);

// --- Everything below this line requires a login ---
app.use(requireAuth);
useChannels(app);
useMessages(app);
useSets(app);

const server = app.listen(PORT, '0.0.0.0',() => console.log(`Example app is listening on port ${PORT}.`));

// Function to handle the actual cleanup
const gracefulShutdown = (signal: string) => {
	console.log(`Received ${signal}. Shutting down gracefully...`);

	// 1. Stop accepting new requests
	server.close(() => {
		console.log('HTTP server closed.');

		// 2. Close other resources (Add your Valkey/DB logic here later)
		// if (valkeyClient) await valkeyClient.quit();

		console.log('Cleanup complete. Exiting.');
		process.exit(0);
	});

	// Force exit after 10 seconds if it hangs
	setTimeout(() => {
		console.error('Could not close connections in time, forcefully shutting down');
		process.exit(1);
	}, 10000);
};

// Listen for both Ctrl+C (SIGINT) and Docker stop (SIGTERM)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));


