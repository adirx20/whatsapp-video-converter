import React from 'react';
import './FileSelector.css';

export const FileSelector = ({ className, title, path, placeholder, onClick }) => {
    return (
        <div className={`file-selector ${className || ''}`}>
            <div className='file-selector_label'>{title}</div>
            <div className='file-selector_content'>
                <div
                    className='file-selector_path'
                    title={path}
                >
                    {path || placeholder}
                </div>
                <button
                    className='file-selector_button'
                    onClick={onClick}
                >
                    Browse
                </button>
            </div>
        </div>
    );
};
