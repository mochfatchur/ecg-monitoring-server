const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const APP_PORT = process.env.APP_PORT;
const WS_PORT = process.env.WS_PORT;
const MQTT_BROKER_IP_ADDRESS = process.env.MQTT_BROKER_IP_ADDRESS;
const TOPIC_SUBSCRIBE = process.env.TOPIC_SUBSCRIBE;
const Jwt = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN
};

const ClientOrigin = process.env.CLIENT_BASE_URL;


module.exports = {
    APP_PORT,
    WS_PORT,
    MQTT_BROKER_IP_ADDRESS,
    TOPIC_SUBSCRIBE,
    Jwt,
    ClientOrigin
};
