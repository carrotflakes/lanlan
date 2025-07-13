import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history, nativeLanguage, learningLanguage } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite-preview-06-17" });

    const chat = model.startChat({
      history: (history || []).map((msg: { role: string, parts: string }) => ({ role: msg.role, parts: [{ text: msg.parts }] })),
    });

    const prompt = `You are a language learning assistant. Your goal is to help the user practice ${learningLanguage}. The user's native language is ${nativeLanguage}. Respond only in ${learningLanguage} unless the user explicitly asks for a translation or explanation in their native language. Keep responses concise and focused on language practice.
Just respond in plain text (line breaks are allowed) without any additional formatting or explanation.

User: ${message}`;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to communicate with Gemini API' }, { status: 500 });
  }
}
