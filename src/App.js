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

  // Called when files are dropped via Drag & Drop
  const handleDropFiles = (files) => {
    console.log('[App] Files dropped:', files);
    setInputPaths(files);
  };

  // Called when user clicks to browse for input files
  const handleSelectFiles = async () => {
    if (window.electron) {
      const files = await window.electron.selectFiles();

      if (files && files.length) {
        setInputPaths(files);
      }
    }
  };

  // Called when user selects an output directory
  const handleSelectOutputDir = async () => {
    if (window.electron) {
      const dir = await window.electron.selectOutputDir();

      if (dir) {
        setOutputDir(dir);
        localStorage.setItem('lastOutputDir', dir);
      }
    }
  };

  // Called when user clicks the Convert button
  const handleConvert = async () => {
    if (!inputPaths.length || !outputDir) return;

    setResults([]);
    setError(null);
    setConverting(true);

    try {
      const result = await window.electron.processVideo({
        inputPath: inputPaths,
        outputDir: outputDir
      });

      setResults(result);
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className='app'>
      <header className='app__header'>
        <h1 className='app__title'>WhatsApp Video Converter</h1>
      </header>
      <main className='app__main'>
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
          className='app__button app__button--convert'
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
