import { useEffect, useState } from 'react';
import { classNames } from '../lib/picsum';

interface StreamingTextProps {
  text: string;
  /** ms per char */
  speed?: number;
  /** stream key — change to re-trigger streaming */
  streamKey?: string | number;
  /** Tailwind text color for the blinking cursor */
  cursorColor?: string;
  className?: string;
  /** Called when streaming completes */
  onDone?: () => void;
}

export default function StreamingText({
  text,
  speed = 22,
  streamKey,
  cursorColor = 'bg-zinc-900',
  className,
  onDone,
}: StreamingTextProps) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown('');
    setDone(false);
    if (!text) {
      setDone(true);
      onDone?.();
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
        onDone?.();
      }
    }, speed);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, streamKey, speed]);

  return (
    <span className={className}>
      <span className="whitespace-pre-wrap">{shown}</span>
      {!done && (
        <span
          className={classNames(
            'inline-block w-[2px] h-[1em] align-[-0.15em] ml-0.5 animate-blink',
            cursorColor,
          )}
        />
      )}
    </span>
  );
}
