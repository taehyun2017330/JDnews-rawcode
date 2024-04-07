import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [buttonClicked, setButtonClicked] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = (value) => {
    setButtonClicked(value);
  };

  const handleRedirect = (link) => {
    window.open(link, "_blank");
  };

  return (
    <>
      {showSplash ? (
        <div className="splash-screen">
          <p className="splash-text">이곳에 여러분이 보여주고 싶은 긴 텍스트를 넣으세요.</p>
        </div>
      ) : (
        <div className="phone-screen">
          <div className="phone-content">
            <h1 className="title">신문 요약 서비스</h1>
            <p className="tip">TIP: 요약하고 싶은 글이 있나요? 난이도 상 중 하를 선택해서 요약 수준을 바꿔보세요.</p>
            <div className="button-container">
              <Button variant="danger" onClick={() => handleClick('상')}>
                상
              </Button>
              <Button variant="warning" onClick={() => handleClick('중')}>
                중
              </Button>
              <Button variant="primary" onClick={() => handleClick('하')}>
                하
              </Button>
            </div>
            {buttonClicked && <p className="selected-button">선택한 버튼: {buttonClicked}</p>}
          </div>
          <div className="bottom-buttons">
            <Button variant="info" onClick={() => handleRedirect('https://www.example.com')}>
              외부 링크로 이동
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
