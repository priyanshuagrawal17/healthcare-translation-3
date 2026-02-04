'use client';

import { format } from 'date-fns';
import { MessageSquare } from 'lucide-react';

type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
  messages?: { id: string }[];
};

type Props = {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

export function ConversationList({ conversations, currentId, onSelect, onCreate }: Props) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 min-w-[200px]">
      <div className="p-3 border-b border-slate-200">
        <button
          onClick={onCreate}
          className="w-full py-2 px-3 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700"
        >
          + New conversation
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {conversations.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                currentId === c.id ? 'bg-sky-100 text-sky-800' : 'hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1">{c.title}</span>
            </button>
            <p className="text-xs text-slate-500 pl-9 pb-1">{format(new Date(c.updatedAt), 'MMM d, HH:mm')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
