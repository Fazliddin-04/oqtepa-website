import { useEffect, useState } from 'react'
import styles from './style.module.scss'

export default function Countdown({ value }) {
  const [minute, setMinute] = useState(0)
  const [second, setSecond] = useState(value)

  useEffect(() => {
    let interval = setInterval(() => {
      if (second > 0) {
        setSecond(second - 1)
      }
      if (second === 0) {
        if (minute === 0) {
          clearInterval(interval)
        } else {
          setMinute(minute - 1)
          setSecond(59)
        }
      }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  })

  return (
    <div className={styles.countdown}>
      {minute}:{second < 10 ? '0' + second : second}
    </div>
  )
}
