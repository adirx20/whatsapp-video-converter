import React from 'react';
import './FileSelector.css';

export const FileSelector = ({ title, path, placeholder, onClick }) => {
    return (
        <div className='file-selector'>
            <div className='file-selector__label'>{title}</div>
            <div className='file-selector__content'>
                <div className='file-selector__path' title={path}>
                    {path || placeholder}
                </div>
                <button className='file-selector__button' onClick={onClick}>
                    Browse
                </button>
            </div>
        </div>
    );
};
