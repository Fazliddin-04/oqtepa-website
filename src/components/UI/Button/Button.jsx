import { memo } from 'react'
import styles from './style.module.scss'
import classNames from 'classnames'

function Button({ type, size, color, onClick, style, children }) {
  if (type === 'submit') {
    return (
      <button
        onClick={onClick}
        className={classNames(styles.button, {
          [styles.secondary]: color === 'secondary',
          [styles.disabled]: color === 'disabled',
          [styles.grayscale]: color === 'grayscale',
          [styles.sm]: size === 'sm',
        })}
        style={{ width: '100%', ...style }}
      >
        {children}
      </button>
    )
  }
  return (
    <div
      onClick={onClick}
      className={classNames(styles.button, {
        [styles.secondary]: color === 'secondary',
        [styles.disabled]: color === 'disabled',
        [styles.grayscale]: color === 'grayscale',
        [styles.grayscale_hover]: color === 'grayscale-hover',
        [styles.sm]: size === 'sm',
      })}
      style={{ ...style }}
    >
      {children}
    </div>
  )
}

export default memo(Button)
