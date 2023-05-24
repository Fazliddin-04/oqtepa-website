import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
// Dayjs
import dayjs from 'dayjs'
import weekdayPlugin from 'dayjs/plugin/weekday'
import objectPlugin from 'dayjs/plugin/toObject'
import isSameOrBeforePlugin from 'dayjs/plugin/isSameOrBefore'
import isTodayPlugin from 'dayjs/plugin/isToday'
import('dayjs/locale/uz-latn')
import('dayjs/locale/ru')
import('dayjs/locale/en')
// Style
import styles from './styles.module.scss'

function Calendar({ onSelect }) {
  const router = useRouter()
  const now = dayjs().locale(router.locale == 'uz' ? 'uz-latn' : router.locale)

  dayjs.extend(weekdayPlugin)
  dayjs.extend(objectPlugin)
  dayjs.extend(isTodayPlugin)
  dayjs.extend(isSameOrBeforePlugin)

  const [currentMonth] = useState(now)
  const [arrayOfDays, setArrayOfDays] = useState([])

  const renderDays = () => {
    const dateFormat = 'dd'
    const days = []

    for (let i = 0; i < 7; i++) {
      days.push(<div key={i}>{now.weekday(i).format(dateFormat)}</div>)
    }
    return <div className={styles.weekdays}>{days}</div>
  }

  const getAllDays = () => {
    let currentDate = currentMonth.startOf('week').weekday(0)
    const firstDateAfterNextWeek = currentDate.add(2, 'week').toObject().date

    let allDates = []
    let weekDates = []

    let weekCounter = 1

    while (currentDate.weekday(0).toObject().date !== firstDateAfterNextWeek) {
      const formated = formateDateObject(currentDate)

      weekDates.push(formated)

      if (weekCounter === 7) {
        allDates.push({ dates: weekDates })
        weekDates = []
        weekCounter = 0
      }

      weekCounter++
      currentDate = currentDate.add(1, 'day')
    }

    setArrayOfDays(allDates)
  }

  useEffect(() => {
    getAllDays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderCells = () => {
    const rows = []
    let days = []

    arrayOfDays.forEach((week, index) => {
      week.dates.forEach((d, i) => {
        days.push(
          <div
            className={`${styles.col} ${styles.cell} ${
              d.isCurrentDay
                ? styles.selected
                : !d.isPassedDay
                ? styles.disabled
                : ''
            }`}
            key={i}
          >
            <span onClick={() => onSelect(d.date)}>{d.day}</span>
          </div>
        )
      })
      rows.push(
        <div className={styles.row} key={index}>
          {days}
        </div>
      )
      days = []
    })

    return <div className={styles.body}>{rows}</div>
  }

  const formateDateObject = (date) => {
    const formatedObject = {
      date: date.format('YYYY-MM-DD'),
      day: date.date(),
      isPassedDay: currentMonth.isBefore(date, 'day'),
      isCurrentDay: date.isToday(),
    }

    return formatedObject
  }

  return (
    <div className={styles.calendar}>
      <h4 className={styles.month}>
        {currentMonth.format('MMMM')}{' '}
        {currentMonth.startOf('week').weekday(0).add(2, 'week').toObject()
          .months !== currentMonth.month() &&
          '- ' +
            currentMonth
              .startOf('week')
              .weekday(0)
              .add(2, 'week')
              .format('MMMM')}
      </h4>
      {renderDays()}
      {renderCells()}
    </div>
  )
}

export default Calendar
