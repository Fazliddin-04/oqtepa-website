import classNames from 'classnames'
import { memo } from 'react'
import styles from './style.module.scss'

function Textarea({ id, label, placeholder, onChange, value, className }) {
  return (
    <div className={classNames(styles.formControl, { [className]: className })}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <textarea
        id={id}
        placeholder={placeholder ? placeholder : ''}
        className={styles.textarea}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default memo(Textarea)
