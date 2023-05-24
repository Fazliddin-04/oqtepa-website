import EventRoundedIcon from '@mui/icons-material/EventRounded'
import styles from './style.module.scss'

export default function DatePicker({
  id,
  label,
  placeholder,
  onChange,
  value,
  max,
}) {
  var isFirefox = typeof InstallTrigger !== 'undefined'

  return (
    <div className={styles.formControl}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.input_wrapper}>
        <input
          type="date"
          placeholder={placeholder}
          className={styles.input}
          id={id}
          value={value}
          onChange={onChange}
          max={max}
        />
        {isFirefox && <EventRoundedIcon className={styles.icon} />}
      </div>
    </div>
  )
}
