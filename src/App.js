import React, { useState, useEffect } from 'react';
import './App.css';
import { FileSelector } from './components/FileSelector/FileSelector';
import { ProgressBar } from './components/ProgressBar/ProgressBar';
import { ResultMessage } from './components/ResultMessage/ResultMessage';
import { DragDropZone } from './components/DragDropZone/DragDropZone';

function App() {
  const [inputPaths, setInputPaths] = useState([]);
  const [outputDir, setOutputDir] = useState(() => localStorage.getItem('lastOutputDir') || '');
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // set up event listeners for conversion progress
    if (window.electron) {
      window.electron.onConversionStart(() => setProgress(0));

      window.electron.onConversionProgress((event, percent) => setProgress(percent));
    }
    // cleanup event listeners
    return () => {
      if (window.electron) {
        window.electron.removeConversionListeners();
      }
    };
  }, []);

  const handleSelectFiles = async () => {
    if (window.electron) {
      const filePaths = await window.electron.selectFiles();
      if (filePaths && filePaths.length) {
        setInputPaths(filePaths);
      }
    }
  };

  const handleDropFiles = (files) => {
    console.log('Files dropped:', files);
    setInputPaths(files);
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
    if (!inputPaths.length || !outputDir) return;

    // reset states
    setResults([]);
    setError(null);
    setConverting(true);

    try {
      const result = await window.electron.processVideo({
        inputPath: inputPaths,
        outputDir
      });

      if (result.success) {
        setResults(result);
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

        <DragDropZone
          onFilesSelected={handleDropFiles}
          resetAccepted={false}
        />

        <FileSelector
          className='file-selector'
          title='Input Videos'
          path={inputPaths.join(', ')}
          placeholder='Select a video files'
          onClick={handleSelectFiles}
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
          disabled={!inputPaths.length || !outputDir || converting}
        >
          {converting ? 'Converting...' : 'Convert Videos'}
        </button>

        {converting && <ProgressBar progress={progress} />}

        {
          results.length > 0 &&
          results.map((result, index) => (
            <ResultMessage
              key={index}
              type={result.success ? 'success' : 'error'}
              title={result.success ? 'Conversion Complete!' : 'Error'}
              message={
                result.success
                  ? `File saved to: ${result.outputPath}`
                  : result.error
              }
            />
          ))
        }

        {
          error && (
            <ResultMessage
              type='error'
              title='Error'
              message={error}
            />
          )
        }

      </main>
    </div>
  );
}

export default App;
