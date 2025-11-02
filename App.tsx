import React, { useState } from 'react';
import SetupView from './components/SetupView';
import ReadingView from './components/ReadingView';
import { AppView } from './types';

const App: React.FC = () => {
  const [text, setText] = useState<string>('Welcome to VESTAL. Paste your text here, try fetching an article from Wikipedia, adjust the settings below, and click "Start Reading" to begin. Happy reading!');
  const [wpm, setWpm] = useState<number>(300);
  const [chunkSize, setChunkSize] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(72);
  const [view, setView] = useState<AppView>(AppView.SETUP);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');

  const handleStartReading = () => {
    if (text.trim()) {
      setView(AppView.READING);
    }
  };

  const handleStopReading = () => {
    setView(AppView.SETUP);
  };

  const handleWikipediaSearch = async (query: string, lang: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setSearchError(null);

    const endpoint = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exlimit=1&explaintext=1&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&origin=*`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pageId === '-1') {
          throw new Error(`Article not found for "${query}". Please try a different search term.`);
        }
        const page = pages[pageId];
        const extract = page.extract;
        if (extract) {
          setText(extract);
        } else {
          throw new Error('Could not extract text from the article.');
        }
      } else {
        throw new Error('No articles found. Please try a different search term.');
      }
    } catch (error) {
      if (error instanceof Error) {
        setSearchError(error.message);
      } else {
        setSearchError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <main className="bg-black text-slate-200 h-screen w-screen overflow-hidden flex flex-col items-center justify-center">
      <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
        {view === AppView.SETUP ? (
          <SetupView
            text={text}
            setText={setText}
            wpm={wpm}
            setWpm={setWpm}
            chunkSize={chunkSize}
            setChunkSize={setChunkSize}
            fontSize={fontSize}
            setFontSize={setFontSize}
            onStart={handleStartReading}
            onSearch={handleWikipediaSearch}
            isLoading={isLoading}
            searchError={searchError}
            language={language}
            setLanguage={setLanguage}
          />
        ) : (
          <ReadingView
            text={text}
            wpm={wpm}
            setWpm={setWpm}
            chunkSize={chunkSize}
            setChunkSize={setChunkSize}
            fontSize={fontSize}
            setFontSize={setFontSize}
            onStop={handleStopReading}
          />
        )}
      </div>
    </main>
  );
};

export default App;