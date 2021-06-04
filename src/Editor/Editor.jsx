import styles from './Editor.module.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Preview from './Preview/Preview';
import { getFinalImageUrl } from './Preview/utils';
import Download from '../Download/Download';

const Editor = ({ addNotification, remoteID }) => {
  const [savedShapes, setSavedShapes] = useState([]);
  const [stepCount, setStepCount] = useState(5);
  const [stepWidth, setStepWidth] = useState(100);
  const [stepWidthTemp, setStepWidthTemp] = useState(100);

  useEffect(() => {
    let timer = window.setTimeout(() => {
      setStepWidth(stepWidthTemp);
    }, 250);
  
    return () => {
      window.clearTimeout(timer);
    }
  }, [stepWidthTemp]);

  const options = useMemo(() => ({ stepCount, stepWidth}), [stepCount, stepWidth]);

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
          options={options}
          remoteID={remoteID}
          savedShapes={savedShapes}
        />
      </div>
      <div className={styles.sidebar}>
        <h3>
          Number of steps
        </h3>
        <input type="number" className={styles.steps} min="1" onChange={e => setStepCount(e.target.value)} value={stepCount} />
        <h3>
          Width of steps
        </h3>
        {`${stepWidthTemp}%`}
        <input type="range" className={styles.range} min="1" max="200" onChange={e => setStepWidthTemp(e.target.value)} value={stepWidthTemp} />
        <Download isDisabled={savedShapes.length < 1} url={getFinalImageUrl(remoteID, savedShapes, options)}>Download final image</Download>
        <Download isDisabled={savedShapes.length < 1} url={getFinalImageUrl(remoteID, savedShapes, options, true)}>Download final animation</Download>
      </div>
    </div>
  )
};
export default Editor;