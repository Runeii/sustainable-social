import styles from './Preview.module.css';
import { getPreviewImage, refreshImage, refreshShapes } from './utils';
import React, { useEffect, useRef, useState } from 'react';
import { onMouseDown, onMouseLeave, onMouseMove, onMouseUp } from './CanvasInteractions';

const Preview = ({ addShape, onAddShapeError, originalImage, remoteID, savedShapes }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  useEffect(() => {
    if (!remoteID) {
      return;
    }
  
    setIsLoading(true);
    getPreviewImage(remoteID, savedShapes)
      .then((img) => {
        setIsLoading(false);
        setImage(img);
      })
      .catch(() => {
        setIsLoading(false);
        onAddShapeError();
      })
  }, [remoteID, savedShapes]);

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
          onMouseDown={(e) => onMouseDown(e, image)}
          onMouseUp={(e) => onMouseUp(e, addShape)}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
          ref={canvasRef}
        />
      </div>
    </>
  );
}

export default Preview;