import React, { useCallback } from 'react';
import Button from '../Button/Button.jsx';

const Download = ({ children, url }) => {
  const onClick = useCallback(() => {
    console.log(url)
    window.open(url, "_blank");
  }, [url]);

  return (
    <Button hasUpload={false} isLoading={false} onClick={onClick} text={children}/>
  )
}
  
export default Download;