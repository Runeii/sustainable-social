import styles from './Editor.module.css';
import React, { useCallback, useState } from 'react';
import Preview from './Preview/Preview';
import { getFinalImageUrl } from './Preview/utils';
import Download from '../Download/Download';

const Editor = ({ originalImage, remoteID }) => {

  const [savedShapes, setSavedShapes] = useState([]);

  const addShape = useCallback(shape => {
    setSavedShapes([...savedShapes, shape]);
  }, [savedShapes]);

  const handleAddShapeError = useCallback(() => {
    console.error('Error adding shape:', savedShapes[savedShapes.length - 1]);
    setSavedShapes(savedShapes.slice(savedShapes.length, 1));
  }, [savedShapes]);

  return (
    <div className={styles.frame}>
      <div className={styles.preview}>
        <Preview
          addShape={addShape}
          onAddShapeError={handleAddShapeError}
          originalImage={originalImage}
          remoteID={remoteID}
          savedShapes={savedShapes}
        />
      </div>
      <div className={styles.sidebar}>
        <Download url={getFinalImageUrl(remoteID, savedShapes)}>Download final image</Download>
        <Download url={getFinalImageUrl(remoteID, savedShapes, true)}>Download final animation</Download>
      </div>
    </div>
  )
};
export default Editor;