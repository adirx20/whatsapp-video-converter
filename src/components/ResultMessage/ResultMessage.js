import React from 'react';
import './ResultMessage.css';

export const ResultMessage = ({ type, title, message }) => {
    return (
        <div className={`result-message result-message--${type}`}>
            <h3 className='result-message__title'>{title}</h3>
            <p className='result-message__content'>{message}</p>
        </div>
    );
};
