// // surveyAgent.ts
// import { createReactAgent } from "@langchain/langgraph/prebuilt";
// import { MemorySaver } from "@langchain/langgraph";
// import { ChatOpenAI } from "@langchain/openai";

// // Define your survey form as a JSON dictionary.
// const surveyForm = {
//   fields: [
//     {
//       key: "name",
//       label: "What is your name?",
//       type: "text"
//     },
//     {
//       key: "age",
//       label: "What is your age?",
//       type: "number"
//     },
//     {
//       key: "likesIceCream",
//       label: "Do you like ice cream? (yes/no)",
//       type: "boolean"
//     },
//     {
//       key: "favoriteFlavor",
//       label: "What's your favorite ice cream flavor?",
//       type: "text",
//       condition: { key: "likesIceCream", value: true }
//     }
//   ]
// };


// const systemMessage = `You are an intelligent survey assistant. You have been provided with the following survey form in JSON:
// ${JSON.stringify(surveyForm, null, 2)}

// Your task is to guide the user through the survey by asking one question at a time based on the form.
// • If a field has a condition, only ask it if the condition is met by previous responses (which are in the conversation history).
// • When asking a question, output only the question text.
// • Once all questions have been answered, ask for confirmation with a summary using the format:

// "Here are your responses:
// <responses>

// Is this information correct? (yes/no)"

// After receiving confirmation, output the final survey summary.
// Always use the conversation history to determine which field to ask next.`;

// // Initialize memory to persist state between agent runs.
// const checkpointer = new MemorySaver();

// // Create the React agent. (Since no external tools are needed, we pass an empty array.)
// const surveyAgent = createReactAgent({
//   llm: new ChatOpenAI({
//     model: "gpt-4o", // adjust model as needed
//     openAIApiKey: process.env.OPENAI_API_KEY,
//     temperature: 0,
//     maxTokens: 300,
//     maxRetries: 5,
//   }),
//   tools: [],
//   checkpointSaver: checkpointer,
//   // The messageModifier injects our system instructions.
//   // (Depending on your LangGraph version, you may need to use stateModifier instead.)
//   messageModifier: systemMessage,
// });

// export default surveyAgent;





// surveyAgent.ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import {
  FORM_JSON,
  QUESTION_PROMPT_TEMPLATE,
  CONFIRM_PROMPT_TEMPLATE,
} from "./constant";

// Construct the system message that includes your survey form and prompt templates.
const systemMessage = `You are an intelligent surveyor chatbot guiding a user through a form.
Below is the survey form in JSON format:
${JSON.stringify(FORM_JSON, null, 2)}

Use the following prompt templates when interacting with the user:
Question Prompt Template:
${QUESTION_PROMPT_TEMPLATE}

Confirmation Prompt Template:
${CONFIRM_PROMPT_TEMPLATE}

Your task is to guide the user through the survey by asking one question at a time based on the provided form.
• If a field has a condition, only ask it if the condition is met by previous responses.
• When asking a question, output only the question text.
• Once all questions have been answered, ask for confirmation with a summary using the provided confirmation prompt format.
After receiving confirmation, output the final survey summary.
Always use the conversation history to determine which field to ask next.
`;

// Initialize memory to persist state between agent runs.
const checkpointer = new MemorySaver();

// Create the React agent. (Since no external tools are needed, we pass an empty array.)
const surveyAgent = createReactAgent({
  llm: new ChatOpenAI({
    model: "gpt-4o", // adjust model as needed
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    maxTokens: 300,
    maxRetries: 5,
  }),
  tools: [],
  checkpointSaver: checkpointer,
  // Inject our system instructions (including the survey form and prompt templates)
  messageModifier: systemMessage,
});

export default surveyAgent;
