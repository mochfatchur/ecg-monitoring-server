import { configDotenv } from 'dotenv';

// Load environment variables from .env file
configDotenv();

export const APP_PORT = process.env.APP_PORT;
export const WS_PORT = process.env.WS_PORT;
export const MQTT_BROKER_IP_ADDRESS = process.env.MQTT_BROKER_IP_ADDRESS;
export const TOPIC_SUBSCRIBE = process.env.TOPIC_SUBSCRIBE;
