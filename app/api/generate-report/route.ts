import OpenAI from "openai";

// Server-side only (Next.js API routes)
export async function POST(req: Request) {
    if (!process.env.OPENAI_API_KEY) {
        return Response.json({ error: "Missing OpenAI API Key" }, { status: 500 });
    }

    try {
        const formData = await req.formData();
        const audioFile = formData.get("file") as File;

        if (!audioFile) {
            return Response.json({ error: "No audio file provided" }, { status: 400 });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Step 1: Transcribe Audio using Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
        });

        const userText = transcription.text;

        // Step 2: Generate Medical Report using GPT-4o-mini (or GPT-3.5-turbo)
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost-effective and fast
            messages: [
                {
                    role: "system",
                    content: `You are an expert medical AI assistant. Analyze the patient's spoken symptoms and generate a structured Pre-Consultation Report for the doctor.

                    Output must be plain text only with no markdown symbols, no bullets, no asterisks, no hash symbols, and no numbering.
                    Use short labeled lines in this exact order:
                    Patient Complaint:
                    Duration/Onset:
                    Severity/Pain Level:
                    Associated Symptoms:
                    Preliminary Assessment:

                    Keep it concise, professional, and clinical. Do not provide a diagnosis.`
                },
                {
                    role: "user",
                    content: `Here is the patient's transcript: "${userText}"`
                }
            ],
            temperature: 0.7,
        });

        const report = completion.choices[0].message.content;

        return Response.json({ transcript: userText, report });

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return Response.json({ error: error.message || "Failed to generate report" }, { status: 500 });
    }
}
