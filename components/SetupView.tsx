import React, { useState } from 'react';

interface SetupViewProps {
  text: string;
  setText: (text: string) => void;
  wpm: number;
  setWpm: (wpm: number) => void;
  chunkSize: number;
  setChunkSize: (size: number) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  onStart: () => void;
  onSearch: (query: string, lang: string) => void;
  isLoading: boolean;
  searchError: string | null;
  language: string;
  setLanguage: (lang: string) => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'it', name: 'Italiano' },
  { code: 'ru', name: 'Русский' },
];

const SetupView: React.FC<SetupViewProps> = ({
  text,
  setText,
  wpm,
  setWpm,
  chunkSize,
  setChunkSize,
  fontSize,
  setFontSize,
  onStart,
  onSearch,
  isLoading,
  searchError,
  language,
  setLanguage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isStartDisabled = !text.trim() || isLoading;

  const handleSearchClick = () => {
    onSearch(searchQuery, language);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-full animate-fade-in space-y-4 sm:space-y-6 py-4">
      <header className="text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-600">
          VESTAL
        </h1>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">
          Visual Efficiency & Speed Training at Lightspeed
        </p>
      </header>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="flex-grow flex space-x-2">
          <input
            id="wiki-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Fetch article from Wikipedia..."
            disabled={isLoading}
            className="w-full bg-slate-900/70 border border-slate-700 rounded-lg py-2 px-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 disabled:opacity-50 placeholder-slate-500"
          />
           <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isLoading}
            className="bg-slate-900/70 border border-slate-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 disabled:opacity-50"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSearchClick}
          disabled={isLoading || !searchQuery.trim()}
          className="w-full sm:w-auto bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 disabled:bg-slate-700 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {searchError && <p className="text-red-400 text-xs sm:text-sm text-center -my-2 sm:-my-4">{searchError}</p>}

      <textarea
        id="text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Or paste your text here..."
        className="flex-grow w-full bg-slate-900/70 border border-slate-700 rounded-lg p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none text-slate-300 placeholder-slate-500"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label htmlFor="wpm-slider" className="block text-sm font-medium text-slate-300 mb-2">
            Words Per Minute: <span className="font-bold text-cyan-400">{wpm} WPM</span>
          </label>
          <input
            id="wpm-slider"
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
          <label htmlFor="chunk-size-slider" className="block text-sm font-medium text-slate-300 mb-2">
            Chunk Size: <span className="font-bold text-cyan-400">{chunkSize} {chunkSize > 1 ? 'Words' : 'Word'}</span>
          </label>
          <input
            id="chunk-size-slider"
            type="range"
            min="1"
            max="7"
            step="1"
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="font-size-slider" className="block text-sm font-medium text-slate-300 mb-2">
            Font Size: <span className="font-bold text-cyan-400">{fontSize}px</span>
          </label>
          <input
            id="font-size-slider"
            type="range"
            min="24"
            max="144"
            step="1"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={isStartDisabled}
        className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold text-lg py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Start Reading
      </button>
    </div>
  );
};

export default SetupView;