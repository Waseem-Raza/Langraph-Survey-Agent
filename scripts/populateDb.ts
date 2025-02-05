import 'dotenv/config';
import sampleData from './sample_data.json';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to process each document in the sample data
const processSampleData = async () => {
  for (const { url, title, content } of sampleData) {
    try {
      // Generate an embedding for the full content
      const { data } = await openai.embeddings.create({
        input: content,
        model: 'text-embedding-ada-002',
      });

      // Log the result; you can modify this to store the embedding elsewhere if needed
      console.log({
        document_id: url,
        embedding: data[0]?.embedding,
        url,
        title,
        content,
      });
    } catch (error) {
      console.error(`Error processing document ${url}:`, error);
    }
  }
  console.log('Data processing complete.');
};

processSampleData().catch(console.error);
