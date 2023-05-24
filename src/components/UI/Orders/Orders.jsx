import { useEffect } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'
import { useSelector } from 'react-redux'
// Utils
import { fetcher } from 'utils/fetcher'
// MUI
import { Container, useMediaQuery, useTheme } from '@mui/material'
// Components
import { OrderPreview } from '../OrderPreview/OrderPreview'
import OrderCard from '../OrderCard/OrderCard'
import Button from '../Button/Button'
import Image from 'next/image'
// Style
import styles from './style.module.scss'

export function Orders() {
  const { t } = useTranslation('order')
  const { user } = useSelector((state) => state.auth)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  const { id } = router.query

  const { data: ordersData } = useSWR(
    user?.id ? `/v1/customers/${user?.id}/orders` : null,
    fetcher
  )

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (ordersData && ordersData?.count == 0) {
    return (
      <div className={styles.empty}>
        <Container>
          <div className={styles.box}>
            <Image
              src="/images/empty_cart.svg"
              alt="empty cart"
              width={100}
              height={100}
              priority={true}
            />
            <h3 dangerouslySetInnerHTML={{ __html: t('no_order_title') }}></h3>
            <p dangerouslySetInnerHTML={{ __html: t('no_order_descr') }}></p>
            <Link href="/" passHref>
              <a>
                <Button>{t('back_to_menu')}</Button>
              </a>
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <Container>
      <div className={styles.box}>
        <h2 className={styles.title}>{t('my_orders')}</h2>
        <div className={styles.flexbox}>
          <div>
            {ordersData?.orders?.map((order) =>
              !isMobile ? (
                <OrderCard key={order.id} order={order} mobile={false} />
              ) : (
                <Link
                  href={{ pathname: '/myorders/[id]', query: { id: order.id } }}
                  passHref
                >
                  <a>
                    <OrderCard key={order.id} order={order} mobile={true} />
                  </a>
                </Link>
              )
            )}
          </div>
          {!isMobile && id && <OrderPreview orderId={id} />}
        </div>
      </div>
    </Container>
  )
}
