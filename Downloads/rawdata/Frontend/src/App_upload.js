import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert('파일을 선택하세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    axios.post('http://localhost:5000/upload', formData, {
      headers: {
          'Content-Type': 'multipart/form-data' // 파일 업로드 시에는 이 헤더를 설정해야 합니다.
      }
  })
      .then(response => {
        console.log('파일 업로드 성공:', response);
        //alert('파일 업로드 성공!');
      })
      .catch(error => {
        console.error('파일 업로드 실패:', error);
        //alert('파일 업로드 실패!');
      });


  };

  return (
    <div className="App">
      <h1>이미지 업로드</h1>
      <input type="file" accept=".png, .jpg, .jpeg" onChange={handleFileChange} />
      <button onClick={handleUpload}>업로드</button>
    </div>
  );
}

export default App;
