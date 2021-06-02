import React, { useCallback, useState } from 'react'
import './App.css'
import Editor from './Editor/Editor';
import Notifier from './Notifier/Notifier';
import Upload from './Upload/Upload';

const App = () => {
  const [notifications, setNotifications] = useState([]);
  const [originalImage, setOriginalImage] = useState(null);
  const [remoteID, setRemoteID] = useState(null);

  const addNotification = useCallback((type, message) => {
    setNotifications(notifications => [...notifications, { type, message }]);
  }, []);

  const onImageUpload = (image, name) => {
    setOriginalImage(image);
    setRemoteID(name)
    addNotification('Success', 'Upload successful.')
  }

  return (
    <div className="page">
      {!originalImage && <Upload onImageUpload={onImageUpload} />}
      {originalImage && <Editor addNotification={addNotification} originalImage={originalImage} remoteID={remoteID} />}
      <Notifier notifications={notifications} />
    </div>
  );
}

export default App
