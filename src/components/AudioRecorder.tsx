'use client';

import { useCallback, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';

type Props = {
  onRecordingComplete: (blob: Blob, durationSeconds: number) => void;
  disabled?: boolean;
};

export function AudioRecorder({ onRecordingComplete, disabled }: Props) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        onRecordingComplete(blob, duration);
      };

      mr.start(200);
      setRecording(true);
    } catch (err) {
      console.error('Microphone access failed:', err);
    }
  }, [onRecordingComplete]);

  const stop = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      mr.stop();
      setRecording(false);
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      {!recording ? (
        <button
          type="button"
          onClick={start}
          disabled={disabled}
          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
          title="Start recording"
        >
          <Mic className="w-5 h-5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={stop}
          className="p-2 rounded-full bg-red-500 text-white animate-pulse"
          title="Stop recording"
        >
          <Square className="w-5 h-5" />
        </button>
      )}
      {recording && <span className="text-sm text-red-600">Recording…</span>}
    </div>
  );
}
