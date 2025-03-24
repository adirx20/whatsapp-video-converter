import React, { useState, useCallback, useRef, useEffect } from 'react';
import './DragDropZone.css';

export const DragDropZone = ({ onFilesSelected, resetAccepted = false }) => {
    const [dragOver, setDragOver] = useState(false);
    const [accepted, setAccepted] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (resetAccepted) {
            console.log('[DragDropZone] Reset accepted state triggered'); // ✅ DEBUG
            setAccepted(false);
        }
    }, [resetAccepted])

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        console.log('[DragDropZone] Drag over'); // ✅ DEBUG

        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        console.log('[DragDropZone] Drag leave'); // ✅ DEBUG

        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        console.log('[DragDropZone] Drop event fired'); // ✅ DEBUG

        setDragOver(false);
        setAccepted(true);

        let files = Array.from(e.dataTransfer.files);
        console.log('[DragDropZone] Files dropped (from files):', files); // ✅ DEBUG: show files array
        // extract file paths
        let filePaths = files.map((file) => file.path).filter(p => !!p);
        // if filePaths is empty, try using text/uri-list as fallback
        if (filePaths.length === 0) {
            let items = Array.from(e.dataTransfer.items);
            console.log('[DragDropZone] DataTransfer items:', items);

            filePaths = items.map(item => {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    // check for file.path if available
                    return file && file.path ? file.path : null;
                }

                return null;
            }).filter(p => p);
        }

        console.log('[DragDropZone] Extracted file paths:', filePaths); // ✅ DEBUG

        if (onFilesSelected) {
            onFilesSelected(filePaths);
        }
    }, [onFilesSelected]);

    const handleClick = () => {
        console.log('[DragDropZone] Clicked'); // ✅ DEBUG

        if (window.electron && window.electron.selectFiles) {
            window.electron.selectFiles().then(filePaths => {
                console.log('[DragDropZone] Files from native dialog:', filePaths);
                if (filePaths && filePaths.length) {
                    if (onFilesSelected) {
                        onFilesSelected(filePaths);
                    }

                    setAccepted(true);
                }
            });
        } else if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleInputChange = (e) => {
        console.log('[DragDropZone] Input change event'); // ✅ DEBUG

        const files = Array.from(e.target.files);
        let filePaths = files.map(file => file.path).filter(p => !!p);
        console.log('[DragDropZone] Files selected from input:', filePaths); // ✅ DEBUG


        if (onFilesSelected) {
            onFilesSelected(filePaths);
        }

        setAccepted(true);
    }

    return (
        <div
            className={`drag-drop-zone ${dragOver ? 'drag-over' : ''} ${accepted ? 'accepted' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <p>Drag & Drop video files here or click to browse</p>
            <input
                type='file'
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleInputChange}
            />
        </div>
    );
};
