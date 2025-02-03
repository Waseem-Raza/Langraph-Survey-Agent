// route.ts
import { NextRequest, NextResponse } from "next/server";
import surveyAgent from "./agent";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    // Default to a starting message if none provided.
    const inputMessages =
      messages || [{ role: "user", content: "I’d like to start the survey." }];

    // Use a fixed thread_id for checkpointing (adjust per session as needed)
    const thread_id = "survey-thread";

    const agentOutput = await surveyAgent.invoke(
      { messages: inputMessages },
      { configurable: { thread_id } }
    );
    // console.log("Agent:", agentOutput);

    const messagesArr = agentOutput.messages || [];
    const aiMessages = messagesArr.filter((msg: any) => {
      if (!msg || typeof msg !== "object") return false;
      // Check for the constructor name or the existence of "tool_calls".
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
    
    // Assuming latestAIMessage is available and has a "content" property.
    const content = latestAIMessage.content;

    // Use a regular expression to extract the text between the first pair of double quotes.
    const regex = /"([^"]+)"/;
    const match = content.match(regex);

    // Declare extractedQuestion so it's available outside the conditional.
    let extractedQuestion: string;

    if (match && match[1]) {
      extractedQuestion = match[1];
      console.log("Extracted question:", extractedQuestion);
    } else {
      console.error("No question found in the content. Returning full content instead.");
      // console.log("content",content);
      
      extractedQuestion = content;
    }

    return new NextResponse(
      JSON.stringify({ extractedQuestion}),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error: any) {
    console.error("Error in survey agent route:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
