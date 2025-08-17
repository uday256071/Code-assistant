require('dotenv').config();
const { OpenAI } = require('openai');
const prompts = require('prompts');
const { TOOL_MAP } = require('./tools.js');

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
    type: 'text',
    name: 'prompt',
    message: 'What would you like to do?',
  });

  if (!prompt) {
    console.log('No prompt provided. Exiting.');
    return;
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  while (true) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
    });

    const rawContent = response.choices[0].message.content;
    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (error) {
        console.log('Error parsing JSON from model:', rawContent);
        break;
    }


    messages.push({
      role: 'assistant',
      content: JSON.stringify(parsedContent),
    });

    if (parsedContent.step === 'START') {
      console.log(`🔥`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === 'THINK') {
      console.log(`	🧠`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === 'TOOL') {
      const toolToCall = parsedContent.tool_name;
      if (!TOOL_MAP[toolToCall]) {
        messages.push({
          role: 'developer',
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
        role: 'developer',
        content: JSON.stringify({ step: 'OBSERVE', content: responseFromTool }),
      });
      continue;
    }

    if (parsedContent.step === 'OUTPUT') {
      console.log(`🤖`, parsedContent.content);
      break;
    }
  }

  console.log('Done...');
}

main();