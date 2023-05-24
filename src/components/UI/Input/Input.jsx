import { useState } from 'react'
import PropTypes from 'prop-types'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import classNames from 'classnames'
import styles from './style.module.scss'

export default function Input({
  id,
  label,
  type,
  placeholder,
  edit,
  onEdit,
  value,
  className,
  disabled,
  onChange,
  isError,
  onKeyUp,
  errorMessage = 'Ошибка',
  required,
}) {
  const [editing, setEditing] = useState(false)

  const onNumberKeyDown = (e) => {
    const txt = e.target.value
    // prevent more than 12 characters, ignore the spacebar, allow the backspace
    if ((txt.length == 12 || e.which == 32) & (e.which !== 8))
      e.preventDefault()
    // add spaces after 3 & 7 characters, allow the backspace
    if (
      (txt.length == 2 || txt.length == 6 || txt.length == 9) &&
      e.which !== 8
    )
      e.target.value = e.target.value + ' '
  }

  const onTelChange = (e) => {
    if (
      /[0-9]/.test(e.nativeEvent.data) ||
      e.nativeEvent.inputType == 'deleteContentBackward'
    )
      onChange(e)
  }

  const editHandler = () => {
    if (editing) {
      onEdit()
      setEditing(false)
    } else setEditing(true)
  }

  return (
    <div
      className={classNames(styles.formControl, {
        [styles.phone]: type === 'tel',
        [className]: className,
      })}
    >
      <label className={styles.label}>{label}</label>
      <div className={styles.input_wrapper}>
        <input
          type={type === 'number' ? 'tel' : type}
          placeholder={placeholder ? placeholder + (required ? '*' : '') : null}
          className={classNames(styles.input, {
            [styles.error]: isError,
            [styles.disabled]: disabled || (edit && !editing),
          })}
          disabled={disabled || (edit && !editing)}
          value={value}
          onChange={(e) => {
            type === 'tel' ? onTelChange(e) : onChange(e)
          }}
          onKeyUp={(e) => {
            type === 'tel'
              ? onNumberKeyDown(e)
              : onKeyUp
              ? onKeyUp(e)
              : undefined
          }}
          id={id}
          required={required}
          autoComplete="off"
        />
        {edit && (
          <div className={styles.edit} onClick={editHandler}>
            {editing ? <CheckRoundedIcon /> : <EditRoundedIcon />}
          </div>
        )}
      </div>

      {isError && (
        <p
          style={{
            display: 'block',
            color: '#f00',
          }}
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}

Input.propTypes = {
  required: PropTypes.bool,
}
