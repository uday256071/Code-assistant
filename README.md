# Persona AI Chatbot

This project is a full-stack web application that demonstrates how to build a persona-based AI chatbot. It uses a React frontend, a Node.js/Express backend, and the OpenAI API to simulate a conversation with a specific personality.

## Features

-   **Persona-Driven AI:** The AI's personality is shaped by a detailed system prompt.
-   **Client-Server Architecture:** A secure design where the frontend UI is separated from the backend logic and API key management.
-   **Chat History:** The application maintains the context of the conversation.
-   **Modern UI:** A clean, responsive chat interface built with React.

## Project Structure

The project is divided into two main parts:

-   `persona-backend/`: A Node.js Express server that handles API requests, communicates with the OpenAI API, and contains the core persona logic.
-   `persona-ui/`: A React application created with Create React App that provides the user interface.

---

## Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

-   Node.js and npm installed.
-   An OpenAI API key.

### 1. Backend Setup

First, set up and start the backend server.

```bash
# 1. Navigate to the backend directory
cd persona-backend

# 2. Create an environment file
# Create a new file named .env in this directory.

# 3. Add your OpenAI API key to the .env file
# OPENAI_API_KEY="your_secret_api_key_here"

# 4. Install dependencies
npm install

# 5. Start the server
npm start
```

The backend server will now be running on `http://localhost:3001`.

### 2. Frontend Setup

Next, set up and start the frontend application in a **new terminal**.

```bash
# 1. Navigate to the frontend directory
cd persona-ui

# 2. Install dependencies
npm install

# 3. Start the React application
npm start
```

The application will automatically open in your web browser at `http://localhost:3000`.

---

Now you can interact with the Persona AI Chatbot!