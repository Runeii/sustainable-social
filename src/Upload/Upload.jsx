import styles from './Upload.module.css';
import React, { useState } from 'react';

const Upload = ({ onImageUpload }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = (e) => {
    setIsLoading(true);
    const file = e.target?.files?.[0];

    if (!file) {
      setIsLoading(false);
      return;
    }
  

    const formData = new FormData()
    formData.append('image', file, file.name)
  
    const reader = new FileReader();
    reader.readAsDataURL(file);
  
    reader.addEventListener('load', function () {
      const image = new Image();
      image.src = reader.result;
      fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData
      })
      .then(() => onImageUpload(image, file.name));
    });
  }

  if (isLoading) {
    return (
      <div className={styles.spinner}></div>
    )
  }

  return (
    <>
      <input onChange={handleUpload} type="file" id="file" name="file" className={styles.file} />
      <label className={styles.frame} htmlFor="file">
        Click or drag and drop an image to begin
      </label>
    </>
  )
}

export default Upload;