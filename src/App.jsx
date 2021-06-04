import React, { useCallback, useState } from 'react'
import './App.css'
import Editor from './Editor/Editor';
import Notifier from './Notifier/Notifier';
import Upload from './Upload/Upload';

const App = () => {
  const [notifications, setNotifications] = useState([]);
  const [remoteID, setRemoteID] = useState(null);

  const addNotification = useCallback((type, message) => {
    setNotifications(notifications => [...notifications, { type, message }]);
  }, []);

  const onImageUpload = (name) => {
    setRemoteID(name)
    addNotification('Success', 'Upload successful.')
  }

  return (
    <div className="page">
      {!remoteID && <Upload onImageUpload={onImageUpload} />}
      {remoteID && <Editor addNotification={addNotification} remoteID={remoteID} />}
      <Notifier notifications={notifications} />
    </div>
  );
}

export default App
