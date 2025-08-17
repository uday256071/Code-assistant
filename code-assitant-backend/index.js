require("dotenv").config();
const { OpenAI } = require("openai");
const { exec } = require("child_process");
const fs = require("fs").promises;
const prompts = require("prompts");

// --- Tool Implementations ---

async function create_file({ path }) {
  try {
    await fs.writeFile(path, "");
    return `Successfully created file: ${path}`;
  } catch (error) {
    return `Error creating file: ${error.message}`;
  }
}

async function list_files({ directory = "." }) {
  try {
    const files = await fs.readdir(directory);
    return files.join("\n");
  } catch (error) {
    return `Error listing files: ${error.message}`;
  }
}

async function read_file({ path }) {
  try {
    return await fs.readFile(path, "utf-8");
  } catch (error) {
    return `Error reading file: ${error.message}`;
  }
}

async function write_file({ path, content }) {
  try {
    await fs.writeFile(path, content);
    return `Successfully wrote to ${path}`;
  } catch (error) {
    return `Error writing file: ${error.message}`;
  }
}

async function generate_code({ prompt }) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });
    let result = "";
    for await (const chunk of stream) {
      result += chunk.choices[0]?.delta?.content || "";
    }
    return result;
  } catch (error) {
    return `Error generating code: ${error.message}`;
  }
}

async function execute_command({ command }) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        resolve(`Stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

const TOOL_MAP = {
  create_file,
  list_files,
  read_file,
  write_file,
  generate_code,
  execute_command,
};

const openai = new OpenAI();

async function main() {
  const SYSTEM_PROMPT = `
    You are an AI assistant who works on START, THINK and OUTPUT format.
    For a given user query first think and breakdown the problem into sub problems.
    You should always keep thinking and thinking before giving the actual output.

    Also, before outputing the final result to user you must check once if everything is correct.
    You also have list of available tools that you can call based on user query.

    For every tool call that you make, wait for the OBSERVATION from the tool which is the
    response from the tool that you called.

    Available Tools:
    - create_file(args: { path: string }): Creates an empty file.
    - list_files(args: { directory: string }): Lists all files in a given directory.
    - read_file(args: { path: string }): Reads the contents of a file.
    - write_file(args: { path: string, content: string }): Writes content to a file.
    - generate_code(args: { prompt: string }): Generates code based on a prompt.
    - execute_command(args: { command: string }): Executes a shell command on the user's machine and returns the output. Be mindful of the user's operating system.

    Rules:
    - Strictly follow the output JSON format
    - The "input" for a tool must be a JSON object with the argument names as keys.
    - Always follow the output in sequence that is START, THINK, OBSERVE and OUTPUT.
    - Always perform only one step at a time and wait for other step.
    - Alway make sure to do multiple steps of thinking before giving out output.
    - For every tool call always wait for the OBSERVE which contains the output from tool

    Output JSON Format:
    { "step": "START | THINK | OUTPUT | OBSERVE | TOOL" , "content": "string", "tool_name": "string", "input": "OBJECT" }
  `;

  const { prompt } = await prompts({
    type: "text",
    name: "prompt",
    message: "What would you like to do?",
  });

  if (!prompt) {
    console.log("No prompt provided. Exiting.");
    return;
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  while (true) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
    });

    const rawContent = response.choices[0].message.content;
    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (error) {
      console.log("Error parsing JSON from model:", rawContent);
      break;
    }

    messages.push({
      role: "assistant",
      content: JSON.stringify(parsedContent),
    });

    if (parsedContent.step === "START") {
      console.log(`🔥`, parsedContent);
      continue;
    }

    if (parsedContent.step === "THINK") {
      console.log(`	🧠`, parsedContent);
      continue;
    }

    if (parsedContent.step === "TOOL") {
      console.log(`TOOL>>>>>>>`, parsedContent);
      const toolToCall = parsedContent.tool_name;
      if (!TOOL_MAP[toolToCall]) {
        messages.push({
          role: "developer",
          content: `There is no such tool as ${toolToCall}`,
        });
        continue;
      }

      const responseFromTool = await TOOL_MAP[toolToCall](parsedContent.input);

      console.log(
        `🛠️: ${toolToCall}(${JSON.stringify(parsedContent.input)}) = `,
        responseFromTool
      );
      messages.push({
        role: "developer",
        content: JSON.stringify({ step: "OBSERVE", content: responseFromTool }),
      });
      continue;
    }

    if (parsedContent.step === "OUTPUT") {
      console.log(`🤖`, parsedContent.content);
      break;
    }
  }

  console.log("Done...");
}

main();
