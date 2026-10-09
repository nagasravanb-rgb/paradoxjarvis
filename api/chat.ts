import { GoogleGenAI } from "@google/genai";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body) {
      body = {};
    }

    const { model, messages, apiKey: clientApiKey } = body;
    const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

    if (!apiKey) {
      res.status(401).json({ 
        error: 'API key is required. Set GEMINI_API_KEY environment variable in your Vercel Project Settings or configure it in Settings.' 
      });
      return;
    }

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    let systemInstruction: string | undefined = undefined;
    const geminiMessages: any[] = [];
    
    for (const msg of (messages || [])) {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
      } else {
        geminiMessages.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    const targetModel = (!model || model === 'llama3' || model === 'gemini-3.5-flash' || model === 'gemini-2.5-flash') 
      ? 'gemini-3.8-flash' 
      : model;

    const responseStream = await ai.models.generateContentStream({
      model: targetModel,
      contents: geminiMessages,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        const payload = JSON.stringify({ message: { content: chunk.text } });
        res.write(`${payload}\n`);
      }
    }
    
    res.end();
  } catch (error: any) {
    console.error('API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Internal server error' });
    } else {
      const payload = JSON.stringify({ error: error.message || 'Internal server error' });
      res.write(`${payload}\n`);
      res.end();
    }
  }
}
