import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { PlayIcon, PauseIcon, StopIcon } from './icons';

interface ReadingViewProps {
  text: string;
  wpm: number;
  setWpm: (wpm: number) => void;
  chunkSize: number;
  setChunkSize: (size: number) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  onStop: () => void;
}

const ReadingView: React.FC<ReadingViewProps> = ({ text, wpm, setWpm, chunkSize, setChunkSize, fontSize, setFontSize, onStop }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const textRef = useRef<HTMLParagraphElement>(null);

  const chunks = useMemo(() => {
    const words = text.trim().split(/\s+/);
    const result = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      result.push(words.slice(i, i + chunkSize).join(' '));
    }
    return result.filter(chunk => chunk.length > 0);
  }, [text, chunkSize]);

  const intervalTime = useMemo(() => {
    if (wpm === 0) return Infinity;

    const currentChunk = chunks[currentIndex];
    if (!currentChunk) {
        return (60 * 1000 * chunkSize) / wpm;
    }
    
    const wordsInCurrentChunk = currentChunk.split(/\s+/).length;
    const baseInterval = (60 * 1000 * wordsInCurrentChunk) / wpm;

    // Add a subtle pause for punctuation at the end of a chunk
    let additionalPause = 0;
    const lastChar = currentChunk.slice(-1);

    if (lastChar === ',') {
      additionalPause = 150; // ms pause for a comma
    } else if (lastChar === '.' || lastChar === '?' || lastChar === '!') {
      additionalPause = 250; // ms pause for end of a sentence
    }

    return baseInterval + additionalPause;
  }, [wpm, currentIndex, chunks, chunkSize]);


  const totalChunks = chunks.length;
  
  const currentChunk = chunks[currentIndex] || (totalChunks > 0 ? '' : 'Finished');

  useLayoutEffect(() => {
    const textEl = textRef.current;
    if (!textEl || !textEl.parentElement) return;

    const checkAndResize = () => {
      if (!textEl || !textEl.parentElement) return;
      
      // Reset to user-defined size for measurement
      textEl.style.fontSize = `${fontSize}px`;
      
      const parentWidth = textEl.parentElement.clientWidth;
      const textWidth = textEl.scrollWidth;

      if (textWidth > parentWidth) {
        const newFontSize = (parentWidth / textWidth) * fontSize;
        // 0.95 is a safety margin, Math.max prevents it from becoming unreadably small
        textEl.style.fontSize = `${Math.max(12, newFontSize * 0.95)}px`;
      }
    };
    
    // Check on chunk change and on window resize
    checkAndResize();
    window.addEventListener('resize', checkAndResize);

    return () => {
      window.removeEventListener('resize', checkAndResize);
    };

  }, [currentChunk, fontSize]);


  useEffect(() => {
    if (!isRunning || totalChunks === 0) {
      return;
    }

    const timerId = setTimeout(() => {
      if (currentIndex < totalChunks - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsRunning(false);
        // Do not call onStop() automatically, let the user decide.
      }
    }, intervalTime);

    return () => clearTimeout(timerId);
  }, [currentIndex, isRunning, totalChunks, intervalTime]);


  const toggleRunning = () => {
    // If at the end, pressing play should restart
    if (currentIndex >= totalChunks - 1 && !isRunning) {
      setCurrentIndex(0);
    }
    setIsRunning(prev => !prev);
  };
  
  const handleChunkSizeChange = (newSizeStr: string) => {
    const newSize = Number(newSizeStr);
    if (newSize === chunkSize) return;
    
    const currentWordIndex = currentIndex * chunkSize;
    const newChunkIndex = Math.floor(currentWordIndex / newSize);
    
    setChunkSize(newSize);
    setCurrentIndex(newChunkIndex);
  };

  const progressPercentage = totalChunks > 0 ? ((currentIndex + 1) / totalChunks) * 100 : 100;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 animate-fade-in">
      {/* Main Reading Area */}
      <div className="w-full flex-grow flex flex-col items-center justify-center relative p-4">
        <p 
          ref={textRef}
          className="font-bold text-slate-100 text-center select-none"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.1 }}
        >
          {currentChunk}
        </p>
      </div>

      {/* Controls Area */}
      <div className="w-full max-w-4xl mx-auto p-4 bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
          <div>
            <label htmlFor="wpm-slider-reading" className="block text-xs font-medium text-slate-400 mb-1">
              WPM: <span className="font-bold text-cyan-400">{wpm}</span>
            </label>
            <input
              id="wpm-slider-reading"
              type="range"
              min="50"
              max="1500"
              step="10"
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="chunk-size-slider-reading" className="block text-xs font-medium text-slate-400 mb-1">
              Chunk Size: <span className="font-bold text-cyan-400">{chunkSize}</span>
            </label>
            <input
              id="chunk-size-slider-reading"
              type="range"
              min="1"
              max="7"
              step="1"
              value={chunkSize}
              onChange={(e) => handleChunkSizeChange(e.target.value)}
              className="w-full"
            />
          </div>
           <div>
            <label htmlFor="font-size-slider-reading" className="block text-xs font-medium text-slate-400 mb-1">
              Font Size: <span className="font-bold text-cyan-400">{fontSize}px</span>
            </label>
            <input
              id="font-size-slider-reading"
              type="range"
              min="24"
              max="144"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
           <div>
            <label htmlFor="position-slider-reading" className="block text-xs font-medium text-slate-400 mb-1">
              Position: <span className="font-bold text-cyan-400">{Math.round(progressPercentage)}%</span>
            </label>
            <input
              id="position-slider-reading"
              type="range"
              min="0"
              max={totalChunks > 0 ? totalChunks - 1 : 0}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(Number(e.target.value))}
              className="w-full"
              disabled={totalChunks === 0}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={toggleRunning}
            className="p-3 rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/80 transition-all duration-200"
            aria-label={isRunning ? 'Pause reading' : 'Resume reading'}
          >
            {isRunning ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            onClick={onStop}
            className="p-3 rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/80 transition-all duration-200"
            aria-label="Stop reading"
          >
            <StopIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingView;