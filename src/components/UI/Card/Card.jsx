import { useState, useEffect, memo, useCallback } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import Image from 'next/image'
import useSWR from 'swr'
import { useSelector, useDispatch } from 'react-redux'
// Utils
import { fetcher } from 'utils/fetcher'
import numToPrice from 'utils/numToPrice'
// Redux-store
import {
  addToCart,
  removeProduct,
  incrementQuantity,
  decrementQuantity,
} from 'store/cart/cartSlice'
import { mapModalHandler } from 'store/common/commonSlice'
// Hooks
import useCartProduct from 'hooks/useCartProduct'
// MUI
import { useMediaQuery, useTheme } from '@mui/material'
// Components
import Button from '../Button/Button'
import Counter from '../Counter/Counter'
import Carousel from '../Carousel/Carousel'
import MiniCard from '../MiniCard/MiniCard'
import OrderDialog from '../OrderDialog/OrderDialog'
import ModifierCheckbox from '../ModifierCheckbox/ModifierCheckbox'
// Style
import styles from './style.module.scss'
import classNames from 'classnames'

function Card({ size, product }) {
  const [isOrderPopup, setisOrderPopup] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [orderAfterAddress, setOrderAfterAddress] = useState(false)

  const { data: favouritesData } = useSWR(
    () => (isOrderPopup ? '/example' : null),
    fetcher
  )

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const router = useRouter()
  const { t } = useTranslation('common')
  const { user } = useSelector((state) => state.auth)
  const { deliveryType } = useSelector((state) => state.common)

  const { isOrdered, productInCart } = useCartProduct(product.id)

  const addToCartHandler = useCallback(() => {
    dispatch(
      addToCart({
        price: product.out_price,
        client_id: user ? user.id : '',
        product_id: product.id,
        type: product.type,
        variants: [],
        quantity: quantity,
      })
    )
  }, [dispatch, product.id, product.out_price, product.type, quantity, user])

  const onClickCardHandler = useCallback(() => {
    if (deliveryType) addToCartHandler()
    else {
      dispatch(mapModalHandler(true))
      setOrderAfterAddress(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, deliveryType, product.has_modifier])

  const onOrderClick = () => {
    setOrderAfterAddress(false)
    addToCartHandler()
    setisOrderPopup(false)
  }

  const removeHandler = () => {
    dispatch(removeProduct(productInCart.key))
    setisOrderPopup(false)
    setQuantity(1)
  }

  // Listen to map details, if card click & map open, after selecting address, accomplish next action
  useEffect(() => {
    if (deliveryType && orderAfterAddress) {
      addToCartHandler()
    }
  }, [deliveryType, orderAfterAddress, addToCartHandler])

  return (
    <>
      <div
        className={classNames(styles.card, {
          [styles.small]: size === 'sm',
        })}
      >
        <div
          className={styles.card_img}
          onClick={() =>
            deliveryType
              ? setisOrderPopup(true)
              : dispatch(mapModalHandler(true))
          }
        >
          <Image
            src={
              product.image
                ? process.env.BASE_URL + product.image
                : '/images/bot_logo.png'
            }
            alt={product.title[router.locale]}
            objectFit="cover"
            layout="fill"
          />
        </div>
        <div className={styles.card_content}>
          <div
            onClick={() =>
              deliveryType
                ? setisOrderPopup(true)
                : dispatch(mapModalHandler(true))
            }
          >
            <h4 className={styles.title}>{product.title[router.locale]}</h4>
            {size !== 'sm' && (
              <p className={styles.description}>
                {product.description[router.locale].substring(
                  0,
                  isMobile ? 35 : 55
                ) +
                  (product.description[router.locale].length >
                  (isMobile ? 35 : 55)
                    ? '...'
                    : '')}
              </p>
            )}
          </div>
          <div className={styles.card_actions}>
            <p>
              {numToPrice(product.out_price, '')}
              <span>{t('sum')}</span>
            </p>
            {isOrdered ? (
              <Counter
                className={styles.counter}
                variable={productInCart.quantity}
                onIncrease={() =>
                  dispatch(incrementQuantity(productInCart?.key))
                }
                onDecrease={() => {
                  productInCart.quantity > 1
                    ? dispatch(decrementQuantity(productInCart?.key))
                    : removeHandler()
                }}
              />
            ) : (
              <Button size="sm" onClick={onClickCardHandler}>
                {t('add')}
              </Button>
            )}
          </div>
        </div>
      </div>
      <OrderDialog
        open={isOrderPopup}
        setQuantity={setQuantity}
        quantity={quantity}
        product={product}
        productInCart={productInCart}
        isOrdered={isOrdered}
        removeHandler={removeHandler}
        onOrderClick={onOrderClick}
        handleClose={() => setisOrderPopup(false)}
      >
        {favouritesData?.favourites?.length > 0 && (
          <div className={styles.recommended}>
            <h4>{t('something_else?')}</h4>
            <div className={styles.box}>
              <Carousel multiple size="small">
                {favouritesData?.favourites?.map((product) => (
                  <MiniCard key={product.id} product={product} size="small" />
                ))}
              </Carousel>
            </div>
          </div>
        )}
      </OrderDialog>
    </>
  )
}

export default memo(Card)
