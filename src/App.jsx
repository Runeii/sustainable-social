import React, { useEffect, useState } from 'react'
import './App.css'
import Editor from './Editor/Editor';
import Upload from './Upload/Upload';

const App = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [remoteID, setRemoteID] = useState(null);

  const onImageUpload = (image, name) => {
    setOriginalImage(image);
    setRemoteID(name)
  }

  return (
    <div className="page">
      {!originalImage && <Upload onImageUpload={onImageUpload} />}
      {originalImage && <Editor originalImage={originalImage} remoteID={remoteID} />}
    </div>
  );
}

export default App
