// constant.ts

export const FORM_JSON = {
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
        label:
          "What type of business do you own? (Options: Sole Proprietorship, Partnership, Corporation, LLC)",
        options: ["Sole Proprietorship", "Partnership", "Corporation", "LLC"],
        required: true
      },
      {
        key: "pays_sales_tax",
        type: "boolean",
        label: "Do you pay sales tax? (yes/no)",
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
        label: "Do you have employees? (yes/no)",
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
        label:
          "Here is the information I’ve collected so far. Do you confirm that the above information is correct? (yes/no)"
      }
    ]
  }
};

export const QUESTION_PROMPT_TEMPLATE = `
You are an intelligent surveyor chatbot guiding a user through a form.
Please ask the following question:
"{question}"
`;

export const CONFIRM_PROMPT_TEMPLATE = `
I have collected the following information so far:
{responses}

Do you confirm that all of the information is correct? (yes/no)
`;
