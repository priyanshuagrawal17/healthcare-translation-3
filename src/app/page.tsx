'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConversationList } from '@/components/ConversationList';
import { ChatMessage } from '@/components/ChatMessage';
import { AudioRecorder } from '@/components/AudioRecorder';
import { Search, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Message = {
  id: string;
  role: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  createdAt: string;
  audioBlob: string | null;
  audioDuration: number | null;
};

type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
  summary?: string | null;
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'fr', label: 'French' },
];

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String((r.result as string).split(',')[1]));
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [current, setCurrent] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [role, setRole] = useState<'doctor' | 'patient'>('doctor');
  const [doctorLang, setDoctorLang] = useState('en');
  const [patientLang, setPatientLang] = useState('es');
  const [input, setInput] = useState('');

  const fetchConversations = useCallback(async () => {
    const res = await fetch('/api/conversations');
    if (res.ok) {
      const list = await res.json();
      setConversations(list);
    }
    setLoading(false);
  }, []);

  const fetchConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/conversations/${id}`);
    if (res.ok) {
      const conv = await res.json();
      setCurrent(conv);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const convIdFromUrl = searchParams.get('conv');
  useEffect(() => {
    if (convIdFromUrl && !loading) {
      if (current?.id !== convIdFromUrl) fetchConversation(convIdFromUrl);
    }
  }, [convIdFromUrl, loading, current?.id, fetchConversation]);

  const createConversation = useCallback(async () => {
    const res = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    if (res.ok) {
      const conv = await res.json();
      await fetchConversations();
      setCurrent({ ...conv, messages: [] });
    }
  }, [fetchConversations]);

  const selectConversation = useCallback(
    (id: string) => {
      if (current?.id === id) return;
      fetchConversation(id);
    },
    [current?.id, fetchConversation]
  );

  useEffect(() => {
    if (current && !conversations.find((c) => c.id === current.id)) setCurrent(null);
  }, [conversations, current]);

  const sourceLang = role === 'doctor' ? doctorLang : patientLang;
  const targetLang = role === 'doctor' ? patientLang : doctorLang;

  const sendMessage = useCallback(
    async (text: string, audioBlob?: string | null, audioDuration?: number | null) => {
      if (!current) return;
      setSending(true);
      let translated = '';
      if (text.trim()) {
        try {
          const tr = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, targetLang, sourceLang }),
          });
          const data = await tr.json();
          translated = data.translated ?? text;
        } catch {
          translated = text;
        }
      }
      const res = await fetch(`/api/conversations/${current.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          originalText: text,
          translatedText: translated,
          sourceLang,
          targetLang,
          audioBlob: audioBlob ?? null,
          audioDuration: audioDuration ?? null,
        }),
      });
      if (res.ok) {
        const msg = await res.json();
        setCurrent((prev) => (prev ? { ...prev, messages: [...prev.messages, msg] } : null));
        setInput('');
      }
      setSending(false);
    },
    [current, role, sourceLang, targetLang]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
  };

  const handleAudioComplete = useCallback(
    async (blob: Blob, durationSeconds: number) => {
      if (!current) return;
      const base64 = await blobToBase64(blob);
      await sendMessage('', base64, durationSeconds);
    },
    [current, sendMessage]
  );

  const generateSummary = useCallback(async () => {
    if (!current) return;
    setSummaryLoading(true);
    try {
      const res = await fetch(`/api/conversations/${current.id}/summary`, { method: 'POST' });
      if (res.ok) {
        const { summary } = await res.json();
        setCurrent((prev) => (prev ? { ...prev, summary } : null));
      }
    } finally {
      setSummaryLoading(false);
    }
  }, [current]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      <aside className="hidden sm:flex flex-col w-64 shrink-0">
        <ConversationList
          conversations={conversations}
          currentId={current?.id ?? null}
          onSelect={selectConversation}
          onCreate={createConversation}
        />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="shrink-0 flex items-center justify-between gap-2 p-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              title="Search conversations"
            >
              <Search className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold text-slate-800 truncate">
              {current ? current.title : 'Healthcare Translation'}
            </h1>
          </div>
          {!current && (
            <button
              onClick={createConversation}
              className="sm:hidden py-2 px-3 rounded-lg bg-sky-600 text-white text-sm"
            >
              + New
            </button>
          )}
        </header>

        {!current ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-slate-600 mb-4">Select a conversation or create a new one.</p>
            <button
              onClick={createConversation}
              className="py-2 px-4 rounded-lg bg-sky-600 text-white font-medium"
            >
              New conversation
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {current.messages.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No messages yet. Send a message or record audio.</p>
              )}
              {current.messages.map((m) => (
                <ChatMessage
                  key={m.id}
                  role={m.role as 'doctor' | 'patient'}
                  originalText={m.originalText}
                  translatedText={m.translatedText}
                  createdAt={m.createdAt}
                  audioBlob={m.audioBlob}
                  audioDuration={m.audioDuration}
                />
              ))}
            </div>

            {current.summary && (
              <div className="shrink-0 mx-4 mb-2 p-4 rounded-xl bg-slate-100 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Summary
                </h3>
                <div className="text-sm text-slate-700 whitespace-pre-wrap">{current.summary}</div>
              </div>
            )}

            <div className="shrink-0 p-3 bg-white border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-sm font-medium text-slate-600">Role:</span>
                <div className="flex gap-1">
                  {(['doctor', 'patient'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-3 py-1 rounded-full text-sm capitalize ${
                        role === r ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-slate-500">Doctor lang:</span>
                <select
                  value={doctorLang}
                  onChange={(e) => setDoctorLang(e.target.value)}
                  className="rounded border border-slate-300 text-sm py-1 px-2"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
                <span className="text-sm text-slate-500">Patient lang:</span>
                <select
                  value={patientLang}
                  onChange={(e) => setPatientLang(e.target.value)}
                  className="rounded border border-slate-300 text-sm py-1 px-2"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={generateSummary}
                  disabled={summaryLoading || current.messages.length === 0}
                  className="ml-auto flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-200 text-slate-700 text-sm hover:bg-slate-300 disabled:opacity-50"
                >
                  {summaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Summary
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                <div className="flex-1 flex gap-2 items-center rounded-xl border border-slate-300 bg-white p-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 py-2 px-2"
                    disabled={sending}
                  />
                  <AudioRecorder onRecordingComplete={handleAudioComplete} disabled={sending} />
                </div>
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="py-2 px-4 rounded-xl bg-sky-600 text-white font-medium disabled:opacity-50 shrink-0"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send'}
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-sky-600" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
