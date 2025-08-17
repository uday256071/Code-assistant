const { exec } = require('child_process');
const fs = require('fs').promises;
const { OpenAI } = require('openai');

const openai = new OpenAI();

async function create_file({ path }) {
  try {
    await fs.writeFile(path, '');
    return `Successfully created file: ${path}`;
  } catch (error) {
    return `Error creating file: ${error.message}`;
  }
}

async function list_files({ directory = '.' }) {
  try {
    const files = await fs.readdir(directory);
    return files.join('\n');
  } catch (error) {
    return `Error listing files: ${error.message}`;
  }
}

async function read_file({ path }) {
  try {
    return await fs.readFile(path, 'utf-8');
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
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });
    let result = '';
    for await (const chunk of stream) {
      result += chunk.choices[0]?.delta?.content || '';
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

module.exports = {
  TOOL_MAP,
};
