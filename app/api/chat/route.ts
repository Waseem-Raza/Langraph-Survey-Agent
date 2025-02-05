// route.ts
import { NextRequest, NextResponse } from "next/server";
import surveyAgent from "./agent"; // ensure this path correctly resolves to your survey agent

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    // Use a starting message if none is provided.
    const inputMessages =
      messages || [{ role: "user", content: "I’d like to start the survey." }];

    // Use a fixed thread_id for checkpointing (adjust per session as needed)
    const thread_id = "survey-thread";

    // Invoke the survey agent with the provided messages and thread ID.
    const agentOutput = await surveyAgent.invoke(
      { messages: inputMessages },
      { configurable: { thread_id } }
    );

    // Extract messages from the agent output.
    const messagesArr = agentOutput.messages || [];
    const aiMessages = messagesArr.filter((msg: any) => {
      if (!msg || typeof msg !== "object") return false;
      // Check if the message is an AI message or if it includes tool_calls.
      return (
        (msg.constructor && msg.constructor.name === "AIMessage") ||
        ("tool_calls" in msg)
      );
    });

    if (aiMessages.length === 0) {
      throw new Error("No AI messages found in the agent output.");
    }

    let latestAIMessage = aiMessages[aiMessages.length - 1];
    if (latestAIMessage && "kwargs" in latestAIMessage) {
      latestAIMessage = latestAIMessage.kwargs;
    }
    
    // Assuming the latest AI message includes a "content" property.
    const content = latestAIMessage.content;

    // Use a regular expression to extract the text between the first pair of double quotes.
    const regex = /"([^"]+)"/;
    const match = content.match(regex);

    let extractedQuestion: string;
    if (match && match[1]) {
      extractedQuestion = match[1];
      console.log("Extracted question:", extractedQuestion);
    } else {
      console.error("No question found in the content. Returning full content instead.",content);
      extractedQuestion = content;
    }

    return new NextResponse(
      extractedQuestion,
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in survey agent route:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}











