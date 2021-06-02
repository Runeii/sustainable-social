import styles from './Editor.module.css';
import React, { useCallback, useState } from 'react';
import Preview from './Preview/Preview';
import { getFinalImageUrl } from './Preview/utils';
import Download from '../Download/Download';

const Editor = ({ addNotification, originalImage, remoteID }) => {
  const [savedShapes, setSavedShapes] = useState([]);

  const addShape = useCallback(shape => {
    setSavedShapes([...savedShapes, shape]);
    addNotification('Loading...', 'Adding new focus area')
  }, [savedShapes]);

  const handleAddShapeError = useCallback(() => {
    console.error('Error adding shape:', savedShapes[savedShapes.length - 1]);
    setSavedShapes(savedShapes.slice(0, savedShapes.length - 1));
    addNotification('Error', 'Failed to add new focus area, ignoring.')
  }, [savedShapes]);

  return (
    <div className={styles.frame}>
      <div className={styles.preview}>
        <Preview
          addNotification={addNotification}
          addShape={addShape}
          onAddShapeError={handleAddShapeError}
          originalImage={originalImage}
          remoteID={remoteID}
          savedShapes={savedShapes}
        />
      </div>
      <div className={styles.sidebar}>
        <Download isDisabled={savedShapes.length < 1} url={getFinalImageUrl(remoteID, savedShapes)}>Download final image</Download>
        <Download isDisabled={savedShapes.length < 1} url={getFinalImageUrl(remoteID, savedShapes, true)}>Download final animation</Download>
      </div>
    </div>
  )
};
export default Editor;