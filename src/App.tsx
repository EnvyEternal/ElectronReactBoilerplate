import React, { useEffect, useState } from 'react';
import { Highlight } from './types';

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('https://www.example.com');
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    window.electronAPI.loadHighlights().then((loadedHighlights: Highlight[]) => {
      setHighlights(loadedHighlights);
    });

    window.electronAPI.on('highlight-saved', (event: any, highlight: Highlight) => {
      setHighlights((prevHighlights) => [...prevHighlights, highlight]);
    });

    return () => {
      window.electronAPI.removeAllListeners('highlight-saved');
    };
  }, []);

  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <div style={{ flex: 4, padding: '10px', borderRight: '1px solid #ccc', height: '400px', overflowY: 'auto' }}>
        <h2>Your highlights:</h2>
        <hr/>
        <ul>
          {highlights.length === 0 ? (
            <li>No highlights yet!</li>
          ) : (
            highlights.map((highlight, index) => (
              <li key={index}>
                <h4>{highlight.title}</h4>
                <p>{highlight.text}</p>
                <a href={highlight.url} target="_blank" rel="noopener noreferrer">
                  {highlight.url}
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
      <div style={{ flex: 2, padding: '10px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ flexGrow: 1, marginRight: '10px' }}
          />
          <button onClick={() => window.electronAPI.loadUrl(url)} style={{ flexShrink: 0 }}>Go</button>
        </div>
        <div
          id="webview-container"
          style={{
            flexGrow: 1,
            border: '1px solid #ccc',
            position: 'relative',
            height: '400px',
            overflow: 'hidden',
          }}
        >
        </div>
      </div>
    </div>
  );
};

export default App;
