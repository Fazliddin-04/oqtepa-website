import { useState, useEffect, useCallback, memo } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import Image from 'next/image'
import useSWR from 'swr'
// Utils
import { fetcher } from 'utils/fetcher'
import numToPrice from 'utils/numToPrice'
// hooks
import useCartProduct from 'hooks/useCartProduct'
// Redux
import {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeProduct,
} from 'store/cart/cartSlice'
import { mapModalHandler } from 'store/common/commonSlice'
// Components
import { toast } from 'react-toastify'
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MiniCard from '../MiniCard/MiniCard'
import Carousel from '../Carousel/Carousel'
import OrderDialog from '../OrderDialog/OrderDialog'
import Button from '../Button/Button'
import Counter from '../Counter/Counter'
// Style
import styles from './style.module.scss'
import classNames from 'classnames'

function OriginCard({ size, product }) {
  const [quantity, setQuantity] = useState(1)
  const [originProps, setOriginProps] = useState([])
  const [activeVariant, setActiveVariant] = useState(null)
  const [activeOptions, setActiveOptions] = useState(null)
  const [productVariants, setProductVariants] = useState({})
  const [isOrderPopup, setisOrderPopup] = useState(false)
  const [orderAfterAddress, setOrderAfterAddress] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const router = useRouter()
  const { t } = useTranslation('common')
  const { user } = useSelector((state) => state.auth)
  const { deliveryType } = useSelector((state) => state.common)
  const { isOrdered, productInCart } = useCartProduct(activeVariant?.id)

  const { data: productData } = useSWR(
    isOrderPopup && product?.id ? '/get-your-product-data/' + product.id : null,
    fetcher
  )

  const { data: favourites } = useSWR(
    activeVariant ? '/get-recommended-products' : null,
    fetcher
  )

  const onClickCardHandler = useCallback(() => {
    if (deliveryType) setisOrderPopup(true)
    else {
      dispatch(mapModalHandler(true))
      setOrderAfterAddress(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, deliveryType])

  const onOrderClick = () => {
    if (product.type == 'origin' && activeVariant) {
      dispatch(
        addToCart({
          price: activeVariant?.out_price,
          client_id: user ? user.id : '',
          product_id: activeVariant?.id,
          type: 'variant',
          variants: [],
          quantity: quantity,
        })
      )
      setOrderAfterAddress(false)
      setisOrderPopup(false)
    } else {
      toast.info('Variantlardan birini tanlang!')
    }
  }

  const onOptionChange = (val, idx) => {
    setActiveOptions((prevState) =>
      prevState.map((e, i) => (i == idx ? val : e))
    )
  }

  const removeHandler = () => {
    dispatch(removeProduct(productInCart?.key))
    setisOrderPopup(false)
    setQuantity(1)
  }

  // Get variants & property oprtions & select default variant
  useEffect(() => {
    if (productData) {
      const variantsMap = {}
      const optionsMap = {}
      const firstOptions = []
      for (const variantProduct of productData.variant_products) {
        let optionIds = ''
        for (let j = 0; j < variantProduct.product_property.length; j++) {
          const element = variantProduct.product_property[j]
          optionsMap[element.option_id] = element.option_id
          if (optionIds.length > 0) {
            optionIds += '_' + element.option_id
          } else {
            optionIds += element.option_id
          }
        }
        variantsMap[optionIds] = variantProduct
      }
      setProductVariants(variantsMap)
      setOriginProps(productData.properties)
      // Set first options of property to state
      Object.keys(variantsMap)[0]
        ?.split('_')
        .forEach((option) => {
          firstOptions.push(option)
        })
      setActiveOptions(firstOptions)
    }
  }, [productData])

  // Set variant by options
  useEffect(() => {
    for (const [key, value] of Object.entries(productVariants)) {
      if (key == activeOptions.join('_')) {
        setActiveVariant(value)
        break
      } else {
        setActiveVariant(null)
      }
    }
  }, [activeOptions, productVariants])

  return (
    <>
      <div
        className={classNames(styles.card, {
          [styles.small]: size === 'sm',
        })}
        onClick={onClickCardHandler}
      >
        <div
          className={classNames(styles.card_img, {
            [styles.loading]: !product.image,
          })}
        >
          <Image
            src={
              product.image
                ? process.env.BASE_URL + product.image
                : '/images/bot_logo.png'
            }
            alt={product.title[router.locale]}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className={styles.card_content}>
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
          <div className={styles.card_actions}>
            <p>
              {router.locale !== 'uz' && <span>{t('from')}</span>}{' '}
              {numToPrice(product.out_price, '')}
              <span>{t('sum')}</span>
              {router.locale === 'uz' && <span>{t('from')}</span>}
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
              <Button
                size="sm"
                onClick={() =>
                  deliveryType
                    ? setisOrderPopup(true)
                    : dispatch(mapModalHandler(true))
                }
              >
                {t('add')}
              </Button>
            )}
          </div>
        </div>
      </div>
      <OrderDialog
        open={isOrderPopup}
        quantity={quantity}
        isOrdered={isOrdered}
        product={activeVariant}
        productInCart={productInCart}
        setQuantity={setQuantity}
        onOrderClick={onOrderClick}
        removeHandler={removeHandler}
        handleClose={() => setisOrderPopup(false)}
      >
        <div className={styles.dialog_content}>
          {/* {originProps?.map((property, idx) => (
            <div key={property.id} className={styles.option_group}>
              <h4>{property.title[router.locale]}</h4>
              <RadioGroup
                aria-labelledby={property.title.en}
                value={activeOptions[idx]}
                onChange={(e) => onOptionChange(e.target.value, idx)}
              >
                {property.options.map((option) =>
                  idx !== 0
                    ? Object.keys(productVariants).some((item) =>
                        item.includes(
                          idx == 1
                            ? activeOptions[0] + '_' + option.id
                            : idx == 2
                            ? activeOptions[0] +
                              '_' +
                              activeOptions[1] +
                              '_' +
                              option.id
                            : activeOptions[0] +
                              '_' +
                              activeOptions[1] +
                              '_' +
                              activeOptions[2] +
                              '_' +
                              option.id
                        )
                      ) && (
                        <FormControlLabel
                          value={option.id}
                          key={option.id}
                          control={
                            <Radio
                              color="primary"
                              size="small"
                              sx={{ color: 'var(--lightgray-2)' }}
                              disableRipple
                            />
                          }
                          label={option.title[router.locale]}
                          className={styles.option}
                        />
                      )
                    : idx == 0 &&
                      Object.keys(productVariants).some((item) =>
                        item.split('_').includes(option.id)
                      ) && (
                        <FormControlLabel
                          value={option.id}
                          key={option.id}
                          control={
                            <Radio
                              color="primary"
                              size="small"
                              sx={{ color: 'var(--lightgray-2)' }}
                              disableRipple
                            />
                          }
                          label={option.title[router.locale]}
                          className={styles.option}
                        />
                      )
                )}
              </RadioGroup>
            </div>
          ))} */}
          {/* Sample below */}
          <div className={styles.option_group}>
            <h4>property title</h4>
            <RadioGroup>
              <FormControlLabel
                value={1}
                control={
                  <Radio
                    color="primary"
                    size="small"
                    sx={{ color: 'var(--lightgray-2)' }}
                    disableRipple
                  />
                }
                label={'option title'}
                className={styles.option}
              />
              <FormControlLabel
                value={2}
                control={
                  <Radio
                    color="primary"
                    size="small"
                    sx={{ color: 'var(--lightgray-2)' }}
                    disableRipple
                  />
                }
                label={'option title'}
                className={styles.option}
              />
            </RadioGroup>
          </div>
          {/* Sample above */}
        </div>
        {favourites?.favourites?.length > 0 && (
          <div className={styles.recommended}>
            <h4>{t('something_else?')}</h4>
            <div className={styles.box}>
              <Carousel multiple size="small">
                {favourites?.favourites?.map((product) => (
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

export default memo(OriginCard)
