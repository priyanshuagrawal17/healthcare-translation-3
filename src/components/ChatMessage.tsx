'use client';

import { format } from 'date-fns';

type Props = {
  role: 'doctor' | 'patient';
  originalText: string;
  translatedText: string;
  createdAt: Date | string;
  audioBlob?: string | null;
  audioDuration?: number | null;
  highlightQuery?: string;
};

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(re);
  return parts.map((part, i) =>
    i % 2 === 1 ? <mark key={i} className="search-hit bg-amber-200 rounded px-0.5">{part}</mark> : part
  );
}

export function ChatMessage({ role, originalText, translatedText, createdAt, audioBlob, audioDuration, highlightQuery }: Props) {
  const isDoctor = role === 'doctor';
  const time = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;

  return (
    <div className={`flex w-full ${isDoctor ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm border ${
          isDoctor ? 'bg-doctor-bg border-doctor-border text-doctor-text' : 'bg-patient-bg border-patient-border text-patient-text'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{isDoctor ? 'Doctor' : 'Patient'}</span>
          <span className="text-xs opacity-75">{format(time, 'HH:mm')}</span>
        </div>
        {originalText && (
          <p className="text-sm whitespace-pre-wrap">
            {highlightQuery ? highlight(originalText, highlightQuery) : originalText}
          </p>
        )}
        {translatedText && translatedText !== originalText && (
          <p className="text-sm mt-2 opacity-90 border-t border-current/20 pt-2 whitespace-pre-wrap">
            {highlightQuery ? highlight(translatedText, highlightQuery) : translatedText}
          </p>
        )}
        {audioBlob && (
          <div className="mt-2">
            <audio
              controls
              className="w-full max-w-xs h-10"
              src={audioBlob.startsWith('data:') ? audioBlob : `data:audio/webm;base64,${audioBlob}`}
            />
            {audioDuration != null && (
              <span className="text-xs opacity-75">{audioDuration}s</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
