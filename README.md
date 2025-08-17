# AI Code Assistant Agent

This project is a command-line AI agent that can help you with your coding tasks. It uses a "Chain of Thought" like process to understand your requests, break them down into smaller steps, and use a set of tools to accomplish them.

## Features

-   **Agentic System:** A powerful agent that can reason and decide which tools to use to solve a problem.
-   **Chain of Thought:** The agent follows a `START`, `THINK`, `TOOL`, `OBSERVE`, `OUTPUT` process, making its reasoning process transparent.
-   **Rich Toolset:** A set of tools for file system operations, code generation, and command execution.
-   **Interactive CLI:** An interactive command-line interface to interact with the agent.
-   **Powered by OpenAI:** Uses the OpenAI API to understand natural language and generate code.

## Project Structure

The project is contained within the `code-assitant-backend/` directory.

---

## Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

-   Node.js and npm installed.
-   An OpenAI API key.

### Setup

First, set up and start the agent.

```bash
# 1. Navigate to the backend directory
cd code-assitant-backend

# 2. Create an environment file
# Create a new file named .env in this directory.

# 3. Add your OpenAI API key to the .env file
# OPENAI_API_KEY="your_secret_api_key_here"

# 4. Install dependencies
npm install

# 5. Run the agent
node index.js
```

The agent will then prompt you for a command.

---

## Available Tools

The agent has access to the following tools:

-   `create_file(path: string)`: Creates an empty file.
-   `list_files(directory: string)`: Lists all files in a given directory.
-   `read_file(path: string)`: Reads the contents of a file.
-   `write_file(path: string, content: string)`: Writes content to a file.
-   `generate_code(prompt: string)`: Generates code based on a prompt.
-   `execute_command(command: string)`: Executes a shell command on the user's machine.

## Example Usage

Here's an example of how you can interact with the agent:

**You:**
> I want to create a simple web server in Node.js. Please create a file named `server.js` and write the code for a "hello world" express server in it.

**Agent's process:**

```
🔥 The user wants to create a "hello world" express server in a file named server.js.
    🧠 First, I need to generate the code for the express server. I will use the `generate_code` tool for this.
🛠️: generate_code({"prompt":"create a hello world express server"}) = const express = require('express'); ...
    🧠 Now that I have the code, I need to write it to a file named `server.js`. I will use the `write_file` tool for this.
🛠️: write_file({"path":"server.js","content":"const express = require('express'); ..."}) = Successfully wrote to server.js
    🧠 I have successfully created the `server.js` file with the express server code.
🤖 I have created the `server.js` file with a "hello world" express server for you.
```
