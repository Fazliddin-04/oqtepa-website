import { useState, useEffect } from 'react'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import dayjs from 'dayjs'

import { useRadioGroup } from '@mui/material/RadioGroup'
import { FormControlLabel, Radio } from '@mui/material'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'

import classNames from 'classnames'
import styles from './style.module.scss'

function CustomRadio({ value, label, branch, src, advanced }) {
  const [isOpen, setIsOpen] = useState(false)
  const currentTime = dayjs().format('HH:mm')

  const radioGroup = useRadioGroup()
  const { t } = useTranslation('common')
  let checked = false

  useEffect(() => {
    if (branch) {
      if (branch.work_hour_start && branch.work_hour_end) {
        branch.work_hour_start < currentTime &&
          currentTime < branch.work_hour_end
          ? setIsOpen(true)
          : branch.work_hour_start < currentTime &&
            branch.work_hour_end < currentTime &&
            branch.work_hour_end < branch.work_hour_start
            ? setIsOpen(true)
            : branch.work_hour_end > currentTime &&
              branch.work_hour_start > currentTime &&
              branch.work_hour_end < branch.work_hour_start
              ? setIsOpen(true)
              : setIsOpen(false)
      }
    } else {
      setIsOpen(true)
    }
  }, [branch, currentTime])

  if (radioGroup) {
    checked =
      radioGroup.name == 'branches-in-map'
        ? JSON.parse(radioGroup.value)?.name === JSON.parse(value)?.name
        : radioGroup.value === value
  }

  // Get branch schedule status
  const scheduleStatus = (branch) => {
    if (branch && branch.work_hour_start && branch.work_hour_end) {
      return branch.work_hour_start < currentTime &&
        currentTime < branch.work_hour_end ? (
        <span style={{ color: '#5982e7' }}>
          {t('restaurant_will_close_at', {
            work_hour_end: branch.work_hour_end,
          })}
        </span> // current time is between work hours
      ) : branch.work_hour_start < currentTime &&
        branch.work_hour_end < currentTime &&
        branch.work_hour_end < branch.work_hour_start ? (
        <span style={{ color: '#5982e7' }}>
          {t('restaurant_will_close_at', {
            work_hour_end: branch.work_hour_end,
          })}
        </span> // current time is between work hours and work hour end is next day
      ) : branch.work_hour_end > currentTime &&
        branch.work_hour_start > currentTime &&
        branch.work_hour_end < branch.work_hour_start ? (
        <span style={{ color: '#5AC53A' }}>
          {t('open_until', {
            work_hour_end: branch.work_hour_end,
          })}
        </span>
      ) : branch.work_hour_start == '00:00' &&
        branch.work_hour_end == '23:59' ? (
        <span style={{ color: '#5AC53A' }}>{t('works_around_the_clock')}</span> // works around the clock
      ) : (
        <span style={{ color: '#F2271C' }}>
          {t('restaurant_will_open_at', {
            work_hour_start: branch.work_hour_start,
          })}
        </span> // current time is before work hour start and branch work hour ended
      )
    }
  }

  return (
    <FormControlLabel
      value={value}
      id={branch ? branch.id : null}
      label={
        <div
          className={classNames(styles.labelContent, {
            [styles.branch]: branch,
            [styles.advanced]: advanced,
            [styles.payment]: src,
            [styles.disabled]: isOpen === false,
          })}
        >
          {label && src ? (
            <>
              <div className={styles.image}>
                <Image src={src} objectFit="cover" layout="fill" alt={label} />
              </div>
              {label}
            </>
          ) : (
            branch &&
            advanced && (
              <div className={styles.advancedInfo}>
                <h4>
                  <PlaceOutlinedIcon
                    fontSize="small"
                    htmlColor="var(--primary-color)"
                  />{' '}
                  {branch.name}
                </h4>
                <p>{branch.address ? branch.address : branch.destination}</p>
                <p>{scheduleStatus(branch)}</p>
              </div>
            )
          )}
        </div>
      }
      className={classNames(styles.customRadio, {
        [styles.branch]: branch,
        [styles.advanced]: advanced,
        [styles.payment]: src,
        [styles.checked]: checked,
        [styles.disabled]: isOpen === false,
      })}
      control={<Radio color="primary" />}
      labelPlacement="start"
      sx={{
        flex: label ? 1 : null,
        justifyContent: 'space-between',
        marginLeft: 0,
      }}
    />
  )
}

export default CustomRadio
