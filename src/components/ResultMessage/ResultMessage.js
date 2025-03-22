import React from 'react';
import './ResultMessage.css';

export const ResultMessage = ({ type, title, message }) => {
    return (
        <div className={`result-message result-message_${type}`}>
            <h3 className='result-message_title'>{title}</h3>
            <p className='result-message_content'>{message}</p>
        </div>
    );
};
