import React, { useState, useCallback, useRef, useEffect } from 'react';
import { loadFilesFromEvent } from '../../utils/fileLoader';
import './DragDropZone.css';

export const DragDropZone = ({ onFilesSelected, resetAccepted = false }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (resetAccepted) {
            console.log('[DragDropZone] Reset accepted state triggered');

            setIsAccepted(false);
        }
    }, [resetAccepted])

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, [])

    const handleDragOver = useCallback((e) => {
        e.preventDefault();

        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
            e.dataTransfer.effectAllowed = 'copy';
        }
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        console.log('[DragDropZone] Drop event fired');

        setIsDragOver(false);
        setIsAccepted(true);

        if (window.electron && window.electron.getDroppedFilePaths) {
            setTimeout(() => {
                window.electron.getDroppedFilePaths().then((paths) => {
                    console.log('[DragDropZone] Paths from fallback:', paths);
                    if (paths && paths.length > 0) {
                        onFilesSelected(paths);
                    }
                });
            }, 150);
        }
    }, [onFilesSelected]);

    const handleClick = (e) => {
        if (e.detail === 0) return;

        console.log('[DragDropZone] Clicked'); // ✅ DEBUG
        // If available, use Electron's native file dialog
        if (window.electron && window.electron.selectFiles) {
            window.electron.selectFiles().then((files) => {
                if (files && files.length) {
                    onFilesSelected(files);
                    setIsAccepted(true);
                }
            });
        } else if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleInputChange = (e) => {
        const files = Array.from(e.target.files);
        let filePaths = files.map(file => file.path).filter(p => !!p);
        console.log('[DragDropZone] Files selected from input:', filePaths); // ✅ DEBUG

        if (onFilesSelected) {
            onFilesSelected(filePaths);
        }
        setIsAccepted(true);
    }

    return (
        <div
            className={`drag-drop-zone drag-drop-zone--${isDragOver ? 'over' : 'default'} ${isAccepted ? 'drag-drop-zone--accepted' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            dropzone='copy'
        >
            <p className='drag-drop-zone__text'>Drag & Drop video files here or click to browse</p>
            <input
                className='drag-drop-zone__input'
                type='file'
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleInputChange}
            />
        </div>
    );
};
