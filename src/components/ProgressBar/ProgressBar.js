import React from 'react';
import './ProgressBar.css';

export const ProgressBar = ({ progress }) => {
    return (
        <div className='progress_container'>
            <div className='progress_label'>Converting: {Math.round(progress)} %</div>
            <div className='progress-bar_container'>
                <div
                    className='progress-bar_fill'
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};
