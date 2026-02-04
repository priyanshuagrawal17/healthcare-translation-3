'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { ChatMessage } from '@/components/ChatMessage';
import { format } from 'date-fns';

type Match = {
  messageId: string;
  role: string;
  originalText: string;
  translatedText: string;
  createdAt: string;
  contextBefore?: string;
  contextAfter?: string;
};

type Result = {
  conversationId: string;
  conversationTitle: string;
  matches: Match[];
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="shrink-0 flex items-center gap-3 p-4 bg-white border-b border-slate-200">
        <Link href="/" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Back to chat">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-semibold text-slate-800">Search conversations</h1>
      </header>

      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        <form onSubmit={runSearch} className="flex gap-2 mb-6">
          <div className="flex-1 flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2">
            <SearchIcon className="w-5 h-5 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword or phrase..."
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-slate-800"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white font-medium disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        {searched && (
          <div className="space-y-6">
            {results.length === 0 && (
              <p className="text-slate-600 text-center py-8">No matches found.</p>
            )}
            {results.map((r) => (
              <section key={r.conversationId} className="bg-white rounded-xl border border-slate-200 p-4">
                <Link
                  href={`/?conv=${r.conversationId}`}
                  className="font-semibold text-sky-600 hover:underline block mb-3"
                >
                  {r.conversationTitle}
                </Link>
                <div className="space-y-3">
                  {r.matches.map((m) => (
                    <div key={m.messageId} className="border-l-2 border-slate-200 pl-3">
                      {m.contextBefore && (
                        <p className="text-xs text-slate-500 mb-1">… {m.contextBefore}</p>
                      )}
                      <ChatMessage
                        role={m.role as 'doctor' | 'patient'}
                        originalText={m.originalText}
                        translatedText={m.translatedText}
                        createdAt={m.createdAt}
                        highlightQuery={query.trim()}
                      />
                      {m.contextAfter && (
                        <p className="text-xs text-slate-500 mt-1">… {m.contextAfter}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
