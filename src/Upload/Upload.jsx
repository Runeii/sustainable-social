import React, { useState } from 'react';
import { BACKEND } from '../Editor/Preview/utils';
import Button from '../Button/Button.jsx';

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
      fetch(`${BACKEND}/upload`, {
        method: 'POST',
        body: formData
      })
      .then(() => onImageUpload(image, file.name));
    });
  }

  return (
    <Button isLoading={isLoading} onClick={handleUpload} text="Click or drag and drop an image to begin"/>
  )
}
  
export default Upload;