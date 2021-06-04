import styles from './Preview.module.css';
import { getPreviewImage, refreshImage, refreshShapes } from './utils';
import React, { useEffect, useRef, useState } from 'react';
import { onMouseDown, onMouseMove, onMouseUp } from './CanvasInteractions';

const Preview = ({ addNotification, addShape, onAddShapeError, options, remoteID, savedShapes }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  useEffect(() => {
    if (!remoteID) {
      return;
    }
  
    setIsLoading(true);
    getPreviewImage(remoteID, savedShapes, options)
      .then((img) => {
        setIsLoading(false);
        setImage(img);
        if (savedShapes.length > 0) {
          addNotification('Success', 'Added new focus area.')
        }
      })
      .catch(() => {
        setIsLoading(false);
        if (savedShapes.length > 0) {
          onAddShapeError();
        }
      })
  }, [options, remoteID, savedShapes]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
  
    const context = canvasRef.current.getContext('2d');
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    refreshImage(context, canvasRef, containerRef, image);
    refreshShapes(context, savedShapes);
  }, [canvasRef, image, refreshImage, refreshShapes, remoteID, savedShapes]);

  return (
    <>
      <div className={styles.container} ref={containerRef}>
        <canvas
          className={styles.image}
          onMouseDown={(e) => onMouseDown(e, image, addShape)}
          onMouseMove={onMouseMove}
          ref={canvasRef}
        />
        {isLoading && <div className={styles.loader} />}
      </div>
    </>
  );
}

export default Preview;