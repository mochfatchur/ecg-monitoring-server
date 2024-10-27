# ecg-monitoring-server

The **ECG Monitoring Server** is a Node.js-based backend server that manages real-time ECG data streaming. It connects to an MQTT broker to receive ECG data from microcontrollers (such as ESP32 or Raspberry Pi), processes the data, and forwards it to connected clients via WebSocket for real-time monitoring and visualization.


## Table of Contents
- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)

## Description

The **ECG Monitoring Server** is a backend service designed to receive ECG data from microcontroller devices via an MQTT broker, process the incoming data stream, and relay it to clients using WebSockets. This setup allows real-time ECG monitoring in healthcare applications where data from wearable devices or sensors is collected and displayed in a web-based or mobile client.

### Key Components:
- **MQTT Broker**: Receives ECG data from microcontrollers connected to ECG sensors.
- **WebSocket Server**: Sends real-time data to clients for visualization and analysis.
<!-- - **REST API**: Provides endpoints for managing connections, querying data, and configuring the server. -->

## Features

- **MQTT Integration**: Connects to an MQTT broker to receive ECG data from microcontroller-based sensors.
- **Real-time Data Streaming**: Relays ECG data to clients over WebSocket connections.
<!-- - **Data Processing**: Can optionally process or analyze the ECG data for anomalies before forwarding it.
- **Configurable Topics**: Supports customizable MQTT topics for different devices and patients.
- **REST API**: Provides additional functionality via HTTP, such as fetching historical data or managing devices. -->
- **Error Handling**: Graceful error handling for MQTT connections and WebSocket communication.


## Installation

To install and set up the project, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/mochfatchur/ecg-monitoring-server.git
    ```

2. Navigate to the project directory:

    ```bash
    cd ecg-monitoring-server
    ```

3. Install the required dependencies:

    ```bash
    npm install
    ```

## Usage

To start the development server, run:

```bash
npm run dev
