import OpenAI from 'openai';

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey: key });
}

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string> {
  if (!text.trim()) return '';
  const openai = getClient();
  const langNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    zh: 'Chinese',
    ar: 'Arabic',
    hi: 'Hindi',
    fr: 'French',
  };
  const target = langNames[targetLang] || targetLang;
  const source = langNames[sourceLang] || sourceLang;
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a medical translator. Translate the following text from ${source} to ${target}. Preserve medical terminology where appropriate. Output only the translation, no explanations.`,
      },
      { role: 'user', content: text },
    ],
    max_tokens: 500,
  });
  return res.choices[0]?.message?.content?.trim() ?? text;
}

export async function generateMedicalSummary(messages: { role: string; originalText: string; translatedText: string }[]): Promise<string> {
  const openai = getClient();
  const transcript = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.originalText}${m.translatedText !== m.originalText ? ` (translated: ${m.translatedText})` : ''}`)
    .join('\n');
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a medical scribe. Given a doctor-patient conversation, produce a concise clinical summary. Include:
- Chief complaint / reason for visit
- Symptoms mentioned
- Diagnoses or working diagnoses
- Medications (current or prescribed)
- Follow-up actions or recommendations
Use clear headings and bullet points. Be concise.`,
      },
      { role: 'user', content: transcript },
    ],
    max_tokens: 800,
  });
  return res.choices[0]?.message?.content?.trim() ?? 'Unable to generate summary.';
}
