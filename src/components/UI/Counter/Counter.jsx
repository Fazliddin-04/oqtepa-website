import styles from './style.module.scss'
import classNames from 'classnames'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'

export default function Counter({
  variable,
  onIncrease,
  onDecrease,
  min,
  size,
  max,
  unstyled,
  className,
  disabled,
}) {
  return (
    <div
      className={classNames(styles.counter, {
        [styles.unstyled]: unstyled,
        [styles.small]: size == 'sm',
        [className]: className,
      })}
    >
      <div
        className={classNames(styles.button, {
          [styles.disabled]: min === variable || disabled,
        })}
        aria-label="Decrement value"
        onClick={onDecrease}
      >
        <RemoveRoundedIcon />
      </div>
      <div className={styles.value}>{variable}</div>
      <div
        className={classNames(styles.button, {
          [styles.disabled]: max === variable || disabled,
        })}
        aria-label="Increment value"
        onClick={onIncrease}
      >
        <AddRoundedIcon />
      </div>
    </div>
  )
}
