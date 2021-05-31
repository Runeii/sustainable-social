import styles from './Button.module.css';
import React from 'react';

const Button = ({ hasUpload, isLoading, onClick, text }) => {
  if (isLoading) {
    return (
      <div className={styles.spinner}></div>
    )
  }

  if (hasUpload) {
    return (
      <>
        <input onChange={onClick} type="file" id="file" name="file" className={styles.file} />
        <label className={styles.frame} htmlFor="file">
          {text}
        </label>
      </>
    )
  }
  return (
    <div className={styles.frame} onClick={onClick}>
        {text}
    </div>
  )
}

Button.defaultProps = {
  hasUpload: true,
}

export default Button;