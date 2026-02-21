"use server";

import OpenAI from "openai";

// This is a server action that runs securely on the server.
// It will handle the API call without exposing your key to the browser.

export async function generateAIReportAction(formData: FormData): Promise<string> {
    const file = formData.get("file") as File;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY in environment");
    }

    const openai = new OpenAI({ apiKey });

    try {
        // Step 1: Transcribe the audio using Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
        });

        const userText = transcription.text;

        // Step 2: Generate the medical report using GPT
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert medical AI assistant. Analyze the patient's voice note text and generate a structured 'Pre-Consultation Report' for the doctor. Include sections for: Patient Complaint, Duration, Severity (1-10), and Associated Symptoms. Keep it professional and concise."
                },
                {
                    role: "user",
                    content: `Patient Voice Note Transcript: "${userText}"`
                }
            ],
            model: "gpt-3.5-turbo",
        });

        return completion.choices[0].message.content || "Could not generate report.";

    } catch (error: any) {
        console.error("OpenAI Error:", error);
        throw new Error(`Failed to generate report: ${error.message}`);
    }
}
