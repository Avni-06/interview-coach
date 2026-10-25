import { useState, useRef, useEffect, useCallback } from 'react';

const Ctor = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

export const speechSupported = Boolean(Ctor);

const ERRORS = {
  'not-allowed': 'Microphone access is blocked. Allow it in your browser settings and try again.',
  'service-not-allowed': 'Microphone access is blocked. Allow it in your browser settings and try again.',
  'audio-capture': 'No microphone was found.',
  network: 'Speech recognition needs an internet connection.',
};

// Browser speech-to-text. onFinal(text) is called for each finished phrase.
const useSpeech = (onFinal) => {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const recRef = useRef(null);
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!Ctor || recRef.current) return;
    const rec = new Ctor();
    rec.lang = 'en-IN';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const r = e.results[i];
        if (r.isFinal) onFinalRef.current?.(r[0].transcript.trim());
        else live += r[0].transcript;
      }
      setInterim(live);
    };
    rec.onerror = (e) => {
      if (ERRORS[e.error]) setError(ERRORS[e.error]);
    };
    rec.onend = () => {
      recRef.current = null;
      setListening(false);
      setInterim('');
    };

    recRef.current = rec;
    setError('');
    try {
      rec.start();
      setListening(true);
    } catch {
      recRef.current = null;
    }
  }, []);

  useEffect(() => () => recRef.current?.abort(), []);

  return { supported: speechSupported, listening, interim, error, start, stop };
};

export default useSpeech;
