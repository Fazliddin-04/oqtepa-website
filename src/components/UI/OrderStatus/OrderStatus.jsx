import { useState, useEffect } from 'react'

import useTranslation from 'next-translate/useTranslation'
import styles from './style.module.scss'
import classNames from 'classnames'
import { getStatusName, getTrackingStatus } from 'utils/getStatus'

import {
  DoneRounded,
  DoneAllRounded,
  DirectionsBikeRounded,
  RestaurantRounded,
  PriorityHighRounded,
  NoteAddRounded,
} from '@mui/icons-material'
import { Tooltip } from '@mui/material'

export function OrderStatus({ statusId, selfPickup, complex }) {
  const { t } = useTranslation('order')
  const [orderStatus, setOrderStatus] = useState('new')

  useEffect(() => {
    setOrderStatus(getTrackingStatus(statusId))
  }, [statusId])

  return (
    <div className={styles.status_container}>
      {complex && <h2>{t(getStatusName(statusId))}</h2>}
      <div className={styles.status_box}>
        <Tooltip
          title={
            statusId == 'bf9cc968-367d-4391-93fa-f77eda2a7a99'
              ? t('future')
              : t('new')
          }
        >
          <div
            className={classNames(styles.status, {
              [styles.active]:
                orderStatus === 'future' ||
                orderStatus === 'new' ||
                orderStatus === 'cancelled' ||
                orderStatus === 'accepted' ||
                orderStatus === 'getting_ready' ||
                orderStatus === 'ready' ||
                orderStatus === 'courier-picked' ||
                orderStatus === 'delivered',
            })}
          >
            <NoteAddRounded />
          </div>
        </Tooltip>
        <div className={styles.dash}></div>
        <Tooltip
          title={
            statusId == 'b5d1aa93-bccd-40bb-ae29-ea5a85a2b1d1' ||
            statusId == 'c4227d1b-c317-46f8-b1e3-a48c2496206f' ||
            statusId == '6ba783a3-1c2e-479c-9626-25526b3d9d36' ||
            statusId == 'd39cb255-6cf5-4602-896d-9c559d40cbbe'
              ? t('cancelled')
              : t('operator-accepted')
          }
        >
          <div
            className={classNames(styles.status, {
              [styles.active]:
                orderStatus === 'accepted' ||
                orderStatus === 'getting_ready' ||
                orderStatus === 'ready' ||
                orderStatus === 'courier-picked' ||
                orderStatus === 'delivered',
              [styles.error]: orderStatus === 'cancelled',
            })}
          >
            {orderStatus === 'cancelled' ? (
              <PriorityHighRounded />
            ) : (
              <DoneRounded />
            )}
          </div>
        </Tooltip>
        <div className={styles.dash}></div>
        <Tooltip title={t('ready')}>
          <div
            className={classNames(styles.status, {
              [styles.active]:
                orderStatus === 'ready' ||
                orderStatus === 'courier-picked' ||
                orderStatus === 'delivered',
            })}
          >
            <RestaurantRounded />
          </div>
        </Tooltip>
        <div className={styles.dash}></div>
        {!selfPickup && (
          <>
            <Tooltip title={t('courier-picked')}>
              <div
                className={classNames(styles.status, {
                  [styles.active]:
                    orderStatus === 'courier-picked' ||
                    orderStatus === 'delivered',
                })}
              >
                <DirectionsBikeRounded />
              </div>
            </Tooltip>
            <div className={styles.dash}></div>
          </>
        )}
        <Tooltip title={selfPickup ? t('finished') : t('delivered')}>
          <div
            className={classNames(styles.status, {
              [styles.active]: orderStatus === 'delivered',
            })}
          >
            <DoneAllRounded />
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
