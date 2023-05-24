import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import { getStatus, getStatusName } from 'utils/getStatus'
import styles from './style.module.scss'

export default function OrderCard({ order, mobile }) {
  const router = useRouter()
  const { id } = router.query
  const { t } = useTranslation('order')
  return (
    <div
      className={`${styles.card} ${styles[getStatus(order.status_id)]} ${
        id == order.id && !mobile ? styles.isActive : ''
      }`}
      onClick={() =>
        id != order.id && !mobile && router.replace(`/myorders?id=${order.id}`)
      }
    >
      <div>
        <p>
          {t('order_no')}
          {order.external_order_id}
        </p>
        <p>
          {order.order_amount + order.co_delivery_price} {t('sum')}
        </p>
      </div>
      <div>
        <p>{new Date(order.created_at).toLocaleDateString('ru-RU')}</p>
        <p className={styles.status}>{t(getStatusName(order?.status_id))}</p>
      </div>
    </div>
  )
}
