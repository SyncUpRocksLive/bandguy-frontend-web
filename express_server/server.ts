import express, { Express, Request, Response, json } from 'express';
import { readFile } from 'fs';
import { useChannels, channels } from './controller-channels'
import { useMessages, message_queue } from './controller-message'
import { useSets } from './controller-sets';
import { useLogin } from './controller-login';
var cookieParser = require('cookie-parser')

const app: Express = express();

app.use(json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send({ channels: channels, message_queue: message_queue });
});

useChannels(app);
useMessages(app);
useSets(app);
useLogin(app);

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).send('OK');
});

const server = app.listen(9001, '0.0.0.0',() => console.log('Example app is listening on port 9001.'));

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


