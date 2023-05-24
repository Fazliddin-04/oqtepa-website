import { useState, useEffect, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import useTranslation from 'next-translate/useTranslation'
// Services
import { getNearestBranch, getComputedPrice } from 'services'
// MUI
import { Container } from '@mui/material'
// Components
import CardX from '../CardX/CardX'
import Button from '../Button/Button'
import Bill from '../Bill/Bill'
// Style
import styles from './style.module.scss'

function Cart() {
  const [totalPrice, setTotalPrice] = useState(0)
  const [deliveryPrice, setDeliveryPrice] = useState(0)

  const { t } = useTranslation('order')
  const { user } = useSelector((state) => state.auth)
  const { cart } = useSelector((state) => state.cart)
  const { points, deliveryType, branch } = useSelector((state) => state.common)

  useEffect(() => {
    if (cart.length > 0) {
      let total = 0
      cart?.map((product) => {
        total += product.price * product.quantity
      })
      setTotalPrice(total)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart])

  // Set delivery details & Get delivery price
  useEffect(() => {
    if (deliveryType == 'delivery') {
      if (points.length > 0)
        for (const point of points) {
          if (point.isActive) {
            deliveryPriceHandler(point.location[0], point.location[1])
            break
          }
        }
    } else if (deliveryType == 'self-pickup') setDeliveryPrice(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, deliveryType, branch])

  // Get Delivery Price
  const deliveryPriceHandler = async (lat, long) => {
    if (user) {
      getNearestBranch(lat, long, user.access_token)
        .then((res) => {
          for (let nearestBranch of res.branches) {
            if (nearestBranch.is_active) {
              getComputedPrice(
                {
                  branch_id: nearestBranch.id,
                  lat: lat,
                  long: long,
                  order_price: totalPrice,
                },
                user.access_token
              )
                .then((res) => setDeliveryPrice(res.price ? res.price : 0))
                .catch((err) => console.log(err))
              break
            }
          }
        })
        .catch((err) => console.log(err))
    }
  }

  if (cart.length === 0) {
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
            <h3>{t('your_basket_is_empty')}</h3>
            <p>{t('the_items_you_order_will_appear_here')}</p>
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
    <div className={styles.cart}>
      <Container>
        <h2>{t('cart')}</h2>
        <div className={styles.flexbox_wrap_between}>
          <div className={styles.box}>
            {cart?.map((item) => (
              <CardX key={item.key} product={item} />
            ))}
          </div>
          <Bill
            totalPrice={totalPrice}
            deliveryPrice={deliveryPrice}
            minPrice={1000} // minimal_order_price
          />
        </div>
      </Container>
    </div>
  )
}

export default memo(Cart)
