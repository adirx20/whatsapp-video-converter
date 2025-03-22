import React, { useState, useEffect } from 'react';
import './App.css';
import { FileSelector } from './components/FileSelector/FileSelector';
import { ProgressBar } from './components/ProgressBar/ProgressBar';
import { ResultMessage } from './components/ResultMessage/ResultMessage';
import path from 'path-browserify';

function App() {
  const [inputPath, setInputPath] = useState('');
  const [outputDir, setOutputDir] = useState(() => {
    // default to downloads folder
    return localStorage.getItem('lastOutputDir') || '';
  });
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // set up event listeners for conversion progress
    if (window.electron) {
      window.electron.onConversionStart(() => setProgress(0));

      window.electron.onConversionProgress((event, percent) => {
        setProgress(percent);
      });
    }

    // cleanup event listeners
    return () => {
      if (window.electron) {
        window.electron.removeConversionListeners();
      }
    };
  }, []);

  const handleSelectFile = async () => {
    if (window.electron) {
      const filePath = await window.electron.selectFile();
      if (filePath) {
        setInputPath(filePath);
      }
    }
  };

  const handleSelectOutputDir = async () => {
    if (window.electron) {
      const dirPath = await window.electron.selectOutputDir();

      if (dirPath) {
        setOutputDir(dirPath);
        localStorage.setItem('lastOutputDir', dirPath);
      }
    }
  };

  const handleConvert = async () => {
    if (!inputPath || !outputDir) return;

    // reset states
    setResult(null);
    setError(null);
    setConverting(true);

    try {
      const result = await window.electron.processVideo({
        inputPath,
        outputDir
      });

      if (result.success) {
        setResult(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>WhatsApp Video Converter</h1>
      </header>
      <main className='App-main'>
        <FileSelector
          className='file-selector'
          title='Input Video'
          path={inputPath}
          placeholder='Select a video file'
          onClick={handleSelectFile}
        />

        <FileSelector
          className='file-selector'
          title='Output Directory'
          path={outputDir}
          placeholder='Select output directory'
          onClick={handleSelectOutputDir}
        />

        <button
          className='convert-button'
          onClick={handleConvert}
          disabled={!inputPath || !outputDir || converting}
        >
          {converting ? 'Converting...' : 'Convert Video'}
        </button>

        {converting && (
          <ProgressBar progress={progress} />
        )}

        {result && !error && (
          <ResultMessage
            type='success'
            title='Conversion Complete!'
            message={`File saved to: ${result.outputPath}`}
          />
        )}

        {error && (
          <ResultMessage
            type='error'
            title='Error'
            message={error}
          />
        )}
      </main>
    </div>
  );
}

export default App;
