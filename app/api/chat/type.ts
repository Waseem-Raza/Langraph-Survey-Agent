// types.ts
export interface FormField {
  key: string;
  type: 'text' | 'select' | 'boolean' | 'number' | 'repeat' | 'confirmation';
  label: string;
  required?: boolean;
  options?: string[];
  condition?: {
    key: string;
    value: any;
  };
  fields?: FormField[];
}

export interface FormData {
  [key: string]: any;
}

// Added a new flag "completed" so we can stop the graph when done.
export interface SurveyState {
  model: any; // e.g. instance of OpenAI from LangChain
  form: {
    fields: FormField[];
  };
  responses: Record<string, any>;
  currentField: FormField | null;
  userInput: string | null;
  conversation: string[];
  completed: boolean;
}
