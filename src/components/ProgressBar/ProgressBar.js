import React from 'react';
import './ProgressBar.css';

export const ProgressBar = ({ progress }) => {
    return (
        <div className='progress-bar'>
            <div className='progress-bar__label'>
                Converting: {Math.round(progress)} %
            </div>
            <div className='progress-bar__container'>
                <div
                    className='progress-bar__fill'
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};
