import React, { useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import Webcam from 'react-webcam';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import LoadingScreen from './LoadingScreen';
import ResultScreen from './ResultScreen';

function App() {
  const [buttonClicked, setButtonClicked] = useState('중');
  const [photoData, setPhotoData] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false); // Camera off by default
  const [isLoading, setIsLoading] = useState(false);
  const [lastPhoto, setLastPhoto] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [openaiSummary, setOpenaiSummary] = useState('');
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for the file input

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn); // 카메라 상태 토글
  };

  const resetAll = () => {
    setButtonClicked('중'); // Reset to default value or any other initial value you prefer
    setPhotoData(null);
    setIsCameraOn(false);
    setIsLoading(false);
    setLastPhoto(null);
    setOcrText('');
    setOpenaiSummary('');
  };
  

    const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result);
        setLastPhoto(reader.result);
        setIsCameraOn(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRedirect = (link) => {
    window.open(link, "_blank");
  };

  const handleClick = (value) => {
    setButtonClicked(value);
    if (lastPhoto) {
      handleSendPhoto(); // Automatically send photo when difficulty is changed if photo exists
    }
  };

  const handleTakePhoto = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const webcamVideo = webcamRef.current.video;
    canvas.width = webcamVideo.videoWidth;
    canvas.height = webcamVideo.videoHeight;
    context.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);
    const photoDataURL = canvas.toDataURL('image/png');
    setPhotoData(photoDataURL);
    setLastPhoto(photoDataURL);
  };


  const handleSavePhoto = () => {
    const a = document.createElement('a');
    a.href = photoData;
    a.download = 'photo.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const handleSendPhoto = async () => {
    if (!photoData) {
      console.error('No photo data to send');
      return;
    }
    setIsLoading(true);

    const blob = await (await fetch(photoData)).blob();
    const formData = new FormData();
    formData.append('image', blob, 'photo.png');
    formData.append('level', buttonClicked);

    fetch('https://jdnewsback-3274c68e8993.herokuapp.com/process-image', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      setOcrText(data.ocr_text|| "");
      setOpenaiSummary(data.openai_summary);
      setIsLoading(false); // Stop loading once the data is received
         console.log("OCR Text:", data.ocr_text);
    console.log("OpenAI Summary:", data.openai_summary);
    })
    .catch((error) => {
      console.error('Error:', error);
      setIsLoading(false);
    });
  };

  const handleRetryWithNewLevel = (newLevel) => {
    setButtonClicked(newLevel);
    handleSendPhoto(); // Re-send photo with new difficulty level
  };
 
  
  if (isLoading) {
    return <LoadingScreen />;
  } else if (ocrText || openaiSummary) {
    return <ResultScreen ocrText={ocrText} openaiSummary={openaiSummary} onLevelChange={handleRetryWithNewLevel} onBackToStart={resetAll} />;
  } else {
  return (
    <div className="phone-screen">
      <div className="phone-content">
      <img src="mainlogo.png" alt="Main Logo" className="main-logo"/>
          <h1 className="title">신문 요약 서비스</h1>
          <p className="tip">
  <strong>모두를 위한 신문 AI 요약 서비스</strong><br />
  <u>중딩일보에 오신 것을 환영합니다.</u> 어려운 신문, 읽기 힘드신가요? 이제 <strong>중딩일보</strong>를 활용하여 복잡한 신문을 간단하고 쉽게 요약해서 오디오로 들어보세요.<br />
  신문 기사의 사진을 찍거나 사진 파일을 업로드 한 후 본인의 어휘력 수준을 <u>하, 중, 상</u> 으로 선택해주세요. <strong>하</strong>의 난이도는 약 초등학생, <strong>중</strong>은 중학생, <strong>상</strong>은 고등학생 수준으로 설정이 되었습니다. 그다음 요약버튼을 누르기만 하면 그동안 어려웠던 신문 내용이 빠르고 쉽게 요약됩니다!
</p>

<div className="button-container">
            <Button variant={buttonClicked === '하' ? "primary" : "outline-primary"} onClick={() => handleClick('하')}>
              하
            </Button>
            <Button variant={buttonClicked === '중' ? "warning" : "outline-warning"} onClick={() => handleClick('중')}>
              중
            </Button>
            <Button variant={buttonClicked === '상' ? "danger" : "outline-danger"} onClick={() => handleClick('상')}>
              상
            </Button>
          </div>
        {buttonClicked && <p className="selected-button">선택한 버튼: {buttonClicked}</p>}
        <div className="camera-container">
          {isCameraOn && (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              style={{ display: 'block', marginBottom: '10px' }}
            />
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'block', margin: '10px 0' }} />
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          ></canvas>
          <Button
            className="camera-button"
            variant="warning"
            onClick={handleTakePhoto}
            disabled={!isCameraOn}
          >
            사진 찍기
          </Button>
          {photoData && (
            <Button
              className="save-button"
              variant="light"
              onClick={handleSavePhoto}
            >
              사진 저장
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={toggleCamera}
          >
            카메라 {isCameraOn ? '끄기' : '켜기'}
          </Button>
        </div>
        <h2>찍은 사진</h2>
        {photoData && (
          <div className="photo-container">
          
          <img src={photoData} alt="Captured" style={{ width: '80%' }} />
        </div>
      )}
    </div>

    <div className="bottom-buttons">
      {photoData ? (
        // If a photo has been taken, show the 요약하기 button
        <Button variant="success" size="lg" onClick={handleSendPhoto} style={{ width: '100%' }}>
          요약하기!
        </Button>
      ) : (
        // If no photo has been taken, show the 외부 링크로 이동 button
        <Button variant="info" size="lg" onClick={() => handleRedirect('https://www.mk.co.kr/news/politics/10984118')} style={{ width: '100%' }}>
          예시 신문 보기
        </Button>
      )}
    </div>
  </div>
);
}
}

export default App;
