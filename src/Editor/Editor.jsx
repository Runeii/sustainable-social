import styles from './Editor.module.css';
import React, { useState } from 'react';
import Preview from './Preview/Preview';

const Editor = ({ originalImage, remoteID }) => {

  const [savedShapes, setSavedShapes] = useState([]);

  const addShape = shape => {
    setSavedShapes([...savedShapes, shape]);
  }

  const handleAddShapeError = () => {
    console.error('Error adding shape:', savedShapes[savedShapes.length - 1]);
    setSavedShapes(savedShapes.slice(savedShapes.length, 1));
  }

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
    </div>
  )
};
export default Editor;