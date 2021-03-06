import styles from './Button.module.css';
import React from 'react';

const Button = ({ hasUpload, isDisabled, isLoading, onClick, text }) => {
  if (isLoading) {
    return (
      <div className={styles.spinner}></div>
    )
  }

  if (hasUpload) {
    return (
      <>
        <label className={styles.frame} htmlFor="file">
          <input onChange={onClick} type="file" id="file" name="file" className={styles.file} />
          {text}
        </label>
      </>
    )
  }
  return (
    <div className={`${styles.frame} ${isDisabled ? styles.isDisabled : ''}`} onClick={onClick}>
        {text}
    </div>
  )
}

Button.defaultProps = {
  hasUpload: true,
}

export default Button;