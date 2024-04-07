import React from 'react';
import './LoadingScreen.css'; // Make sure to import your updated CSS file

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <h2>현재 요약중입니다...</h2>
      <div className="spinner"></div> {/* This will be our stylized spinner */}
    </div>
  );
};

export default LoadingScreen;
