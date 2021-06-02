import React, { useCallback } from 'react';
import Button from '../Button/Button.jsx';

const Download = ({ children, isDisabled, url }) => {
  const onClick = useCallback(() => {
    window.open(url, "_blank");
  }, [url]);

  return (
    <Button isDisabled={isDisabled} hasUpload={false} isLoading={false} onClick={onClick} text={children}/>
  )
}
  
export default Download;