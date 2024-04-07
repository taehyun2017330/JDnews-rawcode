import React from 'react';
import { Button } from 'react-bootstrap';

const ResultScreen = ({ ocrText, openaiSummary, onLevelChange, onBackToStart }) => {
  const speakText = (text, lang = 'ko-KR') => { // Default to Korean
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="result-screen">
      <h2>결과</h2>
      <div className="result-section">
        <h3>OCR Text:</h3>
        <p>{ocrText}</p>
      </div>
      <div className="summary-section">
        <h3>Summary:</h3>
        <p>{openaiSummary}</p>
      </div>
      <div className="button-container">
        <Button variant="danger" onClick={() => onLevelChange('상')}>상</Button>
        <Button variant="warning" onClick={() => onLevelChange('중')}>중</Button>
        <Button variant="primary" onClick={() => onLevelChange('하')}>하</Button>
        <Button variant="info" onClick={() => speakText(openaiSummary)}>Read Summary</Button> {/* Text-to-Speech Button */}
      </div>
      <Button variant="secondary" onClick={onBackToStart} className="mt-3">Back to Start</Button>
    </div>
  );
};

export default ResultScreen;
