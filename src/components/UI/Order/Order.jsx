import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { fetcher } from 'utils/fetcher'
import { getStatusName } from 'utils/getStatus'

import { Container, useMediaQuery, useTheme } from '@mui/material'
import useTranslation from 'next-translate/useTranslation'
import styles from './style.module.scss'
import Loader from '../Loader/Loader'
import numToPrice from 'utils/numToPrice'
import Link from 'next/link'
import { OrderStatus } from '../OrderStatus/OrderStatus'
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps'
import CardX from '../CardX/CardX'
import { LocalPhoneRounded, ChevronLeftRounded } from '@mui/icons-material'

export function Order() {
  const { user } = useSelector((state) => state.auth)
  const { t } = useTranslation('order')
  const router = useRouter()
  const { id } = router.query
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { data: order } = useSWR(user && id ? '/get-your-order/' + id : null, fetcher)

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!order)
    return (
      <div className={styles.order}>
        <section>
          <Loader />
        </section>
      </div>
    )
  return (
    <div className={styles.order}>
      <Container>
        <section>
          <Link href="/myorders">
            <a className={styles.flexbox_align_center}>
              <ChevronLeftRounded /> {t('back_to_catalog')}
            </a>
          </Link>
          <div className={styles.flexbox_center_between}>
            <div>
              <h1 className={styles.title}>
                {t(getStatusName(order?.status_id))}
              </h1>
              {/* <p>Сейчас начнем собирать заказ</p> */}
            </div>
            <OrderStatus
              statusId={order?.status_id}
              selfPickup={order?.delivery_type == 'self-pickup' ? true : false}
            />
          </div>
        </section>
        <section className={styles.map}>
          <YMaps
            query={{
              load: 'Map,Placemark,control.FullscreenControl',
            }}
          >
            <Map
              state={{
                center: [order?.to_location.lat, order?.to_location.long],
                zoom: 13,
                controls: ['fullscreenControl'],
              }}
              style={{
                overflow: 'hidden',
                borderRadius: 12,
                width: '100%',
                height: '100%',
              }}
              modules={['Placemark']}
            >
              {order?.to_location && (
                <Placemark
                  geometry={[order?.to_location.lat, order?.to_location.long]}
                  options={{
                    iconColor: '#735184',
                  }}
                />
              )}
            </Map>
          </YMaps>
        </section>
        <section className={isMobile ? styles.grid_col_1 : styles.grid_col_2}>
          <div className={styles.box}>
            <h3>{t('your_order')}</h3>
            {order?.steps[0].products.map((product) => (
              <CardX
                key={product.id}
                product={product}
                ordered
                size="md"
                className={
                  order?.steps[0].products.length > 1
                    ? styles.cardX
                    : styles.cardX_single
                }
              />
            ))}
          </div>
          <div className={styles.box}>
            <h3>{t('total')}</h3>
            <p className={styles.flexbox_between}>
              {t('products')}{' '}
              <span>{numToPrice(order?.order_amount, t('sum'))}</span>
            </p>
            <p className={styles.flexbox_between}>
              {t('delivery')}
              <span>{numToPrice(order?.delivery_price, t('sum'))}</span>
            </p>
            <hr />
            <h4 className={styles.flexbox_between}>
              {t(order?.paid ? 'paid' : 'to_pay')}
              <span>
                {numToPrice(
                  order?.delivery_price + order?.order_amount,
                  t('sum')
                )}
              </span>
            </h4>
          </div>
          <div className={styles.box}>
            <h3>
              {t('order_details', {
                type:
                  order?.delivery_type == 'delivery'
                    ? router.locale == 'ru'
                      ? 'доставки'
                      : 'Shipping'
                    : router.locale == 'ru'
                    ? 'самовывоза'
                    : 'Pickup',
              })}
            </h3>
            <div>
              <p className={styles.text_midgray_1}>{t('address')}</p>
              <p>{order?.to_address ? order?.to_address : t('unknown')}</p>
            </div>
            {order?.delivery_type === 'delivery' && (
              <div className={styles.courier}>
                <p className={styles.text_midgray_1}>{t('courier_contacts')}</p>
                {order?.courier?.first_name && order?.courier?.phone ? (
                  <>
                    <a
                      href={`tel:+${order?.courier?.phone}`}
                      className={styles.flexbox_align_center}
                    >
                      <LocalPhoneRounded sx={{ fontSize: 18 }} />{' '}
                      {order?.courier?.phone}
                    </a>
                  </>
                ) : (
                  <p>{t('courier_not_assigned_yet')}</p>
                )}
              </div>
            )}
          </div>
        </section>
      </Container>
    </div>
  )
}
