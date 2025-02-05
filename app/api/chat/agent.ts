import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Form Structure
const FORM_JSON = {
  form: {
    fields: [
      {
        key: "business_name",
        type: "text",
        label: "What is your business name?",
        required: true
      },
      {
        key: "business_type",
        type: "select",
        label: "What type of business do you own?",
        options: ["Sole Proprietorship", "Partnership", "Corporation", "LLC"],
        required: true
      },
      {
        key: "pays_sales_tax",
        type: "boolean",
        label: "Do you pay sales tax?",
        required: true
      },
      {
        key: "sales_tax_countries",
        type: "repeat",
        label: "Which countries do you pay sales tax in?",
        condition: {
          key: "pays_sales_tax",
          value: true
        },
        fields: [
          {
            key: "country_name",
            type: "text",
            label: "Country name",
            required: true
          },
          {
            key: "sales_tax_rate",
            type: "number",
            label: "What is the sales tax rate in this country?",
            required: true
          }
        ]
      },
      {
        key: "has_employees",
        type: "boolean",
        label: "Do you have employees?",
        required: true
      },
      {
        key: "employee_count",
        type: "number",
        label: "How many employees do you have?",
        condition: {
          key: "has_employees",
          value: true
        },
        required: true
      },
      {
        key: "confirm_information",
        type: "confirmation",
        label: "Please confirm the information provided is correct."
      }
    ]
  }
};

// Survey State Management
class SurveyState {
  private responses: Record<string, any> = {
    business_name: null, 
    business_type: "LLC",
    pays_sales_tax: null,
    sales_tax_countries: [],
    has_employees: null,
    employee_count: 30,
    confirm_information: null
  };

  private currentFieldIndex = 0;
  private readonly fields = FORM_JSON.form.fields;

  getCurrentField() {
    return this.fields[this.currentFieldIndex];
  }

  getNextField() {
    const field = this.getCurrentField();
    if (!field) return null;

    // Skip if field is already answered
    if (this.isFieldAnswered(field.key)) {
      this.currentFieldIndex++;
      return this.getNextField();
    }

    // Skip if condition is not met
    if (field.condition) {
      const conditionMet = this.checkCondition(field.condition);
      if (!conditionMet) {
        this.currentFieldIndex++;
        return this.getNextField();
      }
    }

    return field;
  }

  private isFieldAnswered(key: string): boolean {
    const value = this.responses[key];
    return value !== null && 
           value !== "" && 
           (!Array.isArray(value) || value.length > 0);
  }

  private checkCondition(condition: { key: string; value: any }): boolean {
    return this.responses[condition.key] === condition.value;
  }

  getValue(key: string) {
    return this.responses[key];
  }

  setValue(key: string, value: any) {
    this.responses[key] = value;
    this.currentFieldIndex++;
  }

  getAllResponses() {
    return this.responses;
  }

  isComplete(): boolean {
    return this.currentFieldIndex >= this.fields.length;
  }
}

// Create survey state instance
const surveyState = new SurveyState();

// Tool Definitions
const readResponse = tool(
  async ({ key }: { key: string }) => {
    const value = surveyState.getValue(key);
    return {
      key,
      exists: value !== null && value !== "" && (!Array.isArray(value) || value.length > 0),
      value
    };
  },
  {
    name: "readFieldState",
    description: "Check if a field has been answered and get its current value.",
    schema: z.object({
      key: z.string().describe("Field key from survey form")
    })
  }
);

const updateResponse = tool(
  async ({ key, value }: { key: string; value: any }) => {
    surveyState.setValue(key, value);
    return { success: true, key };
  },
  {
    name: "updateFieldValue",
    description: "Store a response in the survey data.",
    schema: z.object({
      key: z.string().describe("Field key from survey form"),
      value: z.any().describe("Value to store")
    })
  }
);

// System Instructions
const systemMessage = `
You are a survey bot guiding users through a form. Follow these rules:

1. ALWAYS check the current field state using readFieldState before asking questions
2. Skip fields that are already answered.
3. Only ask about conditional fields when their conditions are met:
   - "sales_tax_countries" only if "pays_sales_tax" is true
   - "What is the sales tax rate in those countries"
   - "employee_count" only if "has_employees" is true
4. Ask one question at a time
5. Store each answer using updateFieldValue immediately after receiving it
6. When all fields are complete, show a summary and ask for confirmation

Provide options only if available. As available in 
Current form state: ${JSON.stringify(surveyState.getAllResponses(), null, 2)}
Form Format: ${JSON.stringify(FORM_JSON, null, 2)}
`;

// Agent Configuration
const surveyAgent = createReactAgent({
  llm: new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
    maxTokens: 300
  }),
  tools: [readResponse, updateResponse],
  checkpointSaver: new MemorySaver(),
  messageModifier: systemMessage
});

// Conversation Handler
export async function handleUserQuery(userMessage: string) {
  console.log("User:", userMessage);
  console.log("Current Survey State:", surveyState.getAllResponses());

  const result = await surveyAgent.invoke({
    messages: [{ role: "user", content: userMessage }]
  });

  const botReply = result.messages.at(-1)?.content || "";
  console.log("Bot:", botReply);

  if (surveyState.isComplete()) {
    console.log("Survey Complete:", surveyState.getAllResponses());
  }

  return botReply;
}

export default surveyAgent;























