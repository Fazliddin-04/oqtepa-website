import { useEffect, useState, forwardRef } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Close, CheckRounded } from '@mui/icons-material'
import styles from './style.module.scss'
import classNames from 'classnames'
import Calendar from '../Calendar/Calendar'
import('dayjs/locale/uz-latn')
import('dayjs/locale/ru')
import('dayjs/locale/en')

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function TimePicker({
  open,
  handleClose,
  onChange,
  value,
  title,
  interval,
  startTime,
  endTime,
}) {
  const [isToday, setIsToday] = useState(true)
  const [tillTmrw, setTillTmrw] = useState(null) // Time until tomorrow
  const [selDate, setSelDate] = useState(null) // Selected Date

  const { t } = useTranslation('order')
  const router = useRouter()
  const currentDate = dayjs().format('YYYY-MM-DD')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  dayjs.extend(isBetween)

  useEffect(() => {
    let ranges = []
    if (isToday) {
      let currentOrderStartTime = dayjs().add(+interval, 'm')
      while (
        currentOrderStartTime.isBetween(
          dayjs().hour(+startTime),
          dayjs().hour(+endTime),
          'h'
        ) &&
        endTime - 1 > currentOrderStartTime.get('hour')
      ) {
        currentOrderStartTime = currentOrderStartTime.add(1, 'h')
        ranges.push(currentOrderStartTime.format('HH') + ':' + '00')
        ranges.push(currentOrderStartTime.format('HH') + ':' + '30')
      }
    } else if (selDate) {
      let orderStartTime =
        selDate && dayjs(selDate).hour(+startTime).add(+interval, 'm')
      while (
        orderStartTime.isBefore(dayjs(selDate).hour(+endTime), 'h') &&
        endTime - 1 > orderStartTime.get('hour')
      ) {
        orderStartTime = orderStartTime.add(1, 'h')
        ranges.push(orderStartTime.format('HH') + ':' + '00')
        ranges.push(orderStartTime.format('HH') + ':' + '30')
      }
    }
    setTillTmrw(ranges)
  }, [endTime, interval, startTime, isToday, selDate])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className={styles.dialog}
      maxWidth="sm"
      fullWidth={true}
      fullScreen={isMobile}
      TransitionComponent={Transition}
    >
      <DialogTitle className={styles.title}>
        {title || 'Hero title'}
      </DialogTitle>
      <DialogContent className={styles.content}>
        <div className={styles.flexbox_align_center}>
          <div
            className={classNames(styles.button_toggle, {
              [styles.active]: isToday,
            })}
            onClick={() => {
              setIsToday(true)
              setSelDate(null)
            }}
          >
            {t('today')}
          </div>
          <div
            className={classNames(styles.button_toggle, {
              [styles.active]: !isToday,
            })}
            onClick={() => setIsToday(false)}
          >
            {t('another_day')}
          </div>
        </div>
        <div className={styles.actions}>
          {isToday ? (
            <div className={styles.grid_col_2}>
              <div
                className={classNames(styles.option, {
                  [styles.active]: value == null,
                })}
                onClick={() => onChange(null)}
              >
                {t('today')}: {interval || 0} {t('minutes')}
                {value == null && (
                  <CheckRounded
                    fontSize="small"
                    htmlColor="var(--primary-color)"
                  />
                )}
              </div>
              {tillTmrw?.map((time) => (
                <div
                  className={classNames(styles.option, {
                    [styles.active]: value == currentDate + ' ' + time,
                  })}
                  key={time}
                  onClick={() => onChange(currentDate + ' ' + time)}
                >
                  {time}
                  {value == currentDate + ' ' + time && (
                    <CheckRounded
                      fontSize="small"
                      htmlColor="var(--primary-color)"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : selDate ? (
            <>
              <h4 className={styles.selected_date}>
                {dayjs(selDate)
                  .locale(router.locale == 'uz' ? 'uz-latn' : router.locale)
                  .format('D MMMM')}
              </h4>
              <div className={styles.grid_col_2}>
                {tillTmrw?.map((time) => (
                  <div
                    className={classNames(styles.option, {
                      [styles.active]: value == selDate + ' ' + time,
                    })}
                    key={time}
                    onClick={() => onChange(selDate + ' ' + time)}
                  >
                    {time}
                    {value == selDate + ' ' + time && (
                      <CheckRounded
                        fontSize="small"
                        htmlColor="var(--primary-color)"
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Calendar
              onSelect={(e) => {
                dayjs(e).get('day') == dayjs().get('day')
                  ? setIsToday(true)
                  : setSelDate(e)
              }}
            />
          )}
        </div>
      </DialogContent>
      <IconButton onClick={handleClose} className={styles.closeIcon}>
        <Close />
      </IconButton>
    </Dialog>
  )
}

export default TimePicker
