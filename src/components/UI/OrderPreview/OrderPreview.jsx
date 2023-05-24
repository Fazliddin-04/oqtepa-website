import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import dayjs from 'dayjs'
import useSWR from 'swr'
// Utils
import { fetcher } from 'utils/fetcher'
import numToPrice from 'utils/numToPrice'
// MUI Icons
import {
  InsertCommentRounded,
  RepeatRounded,
  InfoRounded,
} from '@mui/icons-material'
// Components
import Loader from '../Loader/Loader'
import { OrderStatus } from '../OrderStatus/OrderStatus'
import CardX from '../CardX/CardX'
// Style
import styles from './style.module.scss'

export function OrderPreview({ orderId }) {
  const { t } = useTranslation('order')

  const { data: order } = useSWR(
    orderId ? '/get-your-order/' + orderId : null,
    fetcher
  )

  if (!order) return <Loader />
  return (
    <div className={styles.card_preview}>
      <div>
        <div className={styles.flexbox_between}>
          <p className={styles.text_midgray_1}>
            {t('order_no')} {order?.external_order_id}
          </p>
          <p className={styles.text_midgray_1}>
            {t('created')}: {dayjs(order?.created_at).format('DD.MM.YYYY')}
          </p>
        </div>
        <OrderStatus
          statusId={order?.status_id}
          selfPickup={order?.delivery_type == 'self-pickup' ? true : false}
          complex
        />
        <div className={styles.flexbox_justify_center}>
          <Link href="/contacts" passHref>
            <a>
              <p className={styles.flexbox_align_center}>
                <InsertCommentRounded /> {t('support')}
              </p>
            </a>
          </Link>
          <Link href={`/checkout?repeat=true&orderid=${orderId}`} passHref>
            <p className={styles.flexbox_align_center}>
              <RepeatRounded /> {t('repeat')}
            </p>
          </Link>
          <Link
            href={{ pathname: '/myorders/[id]', query: { id: orderId } }}
            passHref
          >
            <a>
              <p className={styles.flexbox_align_center}>
                <InfoRounded /> {t('detailed')}
              </p>
            </a>
          </Link>
        </div>
      </div>
      <div>
        <p className={styles.text_midgray_1}>{t('address')}</p>
        <p>{order?.to_address ? order?.to_address : t('unknown')}</p>
      </div>
      {order?.is_preorder && (
        <div>
          <p className={styles.text_midgray_1}>
            {t(
              order?.delivery_type == 'self-pickup'
                ? 'pickup_time'
                : 'delivery_time'
            )}
          </p>
          <p>{dayjs(order?.future_time).format('DD.MM.YYYY')}</p>
        </div>
      )}
      <div>
        <p className={styles.text_midgray_1}>{t('order_list')}</p>
        {order?.steps[0].products.map((product) => (
          <CardX key={product.id} product={product} ordered size="sm" />
        ))}
      </div>
      <div className={styles.bill}>
        <p className={styles.text_midgray_1}>{t('payment')}</p>
        <p className={styles.flexbox_between}>
          {t('cost_of_goods')}{' '}
          <span>{numToPrice(order?.order_amount, t('sum'))}</span>
        </p>
        <p className={styles.flexbox_between}>
          {t('cost_of_delivery')}
          <span>{numToPrice(order?.delivery_price, t('sum'))}</span>
        </p>
        <p className={styles.flexbox_center_between}>
          {t('total')}
          <span className={styles.lg_bold}>
            {numToPrice(order?.delivery_price + order?.order_amount, t('sum'))}
          </span>
        </p>
      </div>
    </div>
  )
}
