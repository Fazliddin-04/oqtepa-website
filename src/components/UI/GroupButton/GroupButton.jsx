import { memo } from 'react'
import styles from './style.module.scss'
import classNames from 'classnames'

function GroupButton({ size, style, color, active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={classNames(styles.groupButton, {
        [styles.active]: active,
        [styles.sm]: size === 'sm',
        [styles.md]: size === 'md',
        [styles.primary]: color === 'primary',
      })}
      style={{ ...style }}
    >
      {children}
    </button>
  )
}

export default memo(GroupButton)
