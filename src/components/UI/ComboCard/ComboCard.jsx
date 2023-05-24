import { useState, useEffect, memo } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import Image from 'next/image'
import useSWR from 'swr'
// Redux Store
import { mapModalHandler } from 'store/common/commonSlice'
import {
  addToCart,
  removeProduct,
  incrementLastofProduct,
  decrementLastofProduct,
  removeLastofProduct,
} from 'store/cart/cartSlice'
// Utils
import { fetcher } from 'utils/fetcher'
import numToPrice from 'utils/numToPrice'
// MUI
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  useMediaQuery,
  useTheme,
} from '@mui/material'
// Components
import Button from '../Button/Button'
import Counter from '../Counter/Counter'
import Carousel from '../Carousel/Carousel'
import MiniCard from '../MiniCard/MiniCard'
import OrderDialog from '../OrderDialog/OrderDialog'
// Style
import styles from './style.module.scss'
import useCartProduct from 'hooks/useCartProduct'

function ComboCard({ product }) {
  const [quantity, setQuantity] = useState(1)
  const [isOrderPopup, setisOrderPopup] = useState(false)
  const [comboGroups, setComboGroups] = useState([])
  const [currentVariant, setCurrentVariant] = useState([])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useSelector((state) => state.auth)
  const { deliveryType } = useSelector((state) => state.common)
  const { t } = useTranslation('common')
  const dispatch = useDispatch()
  const router = useRouter()

  const { data: comboData } = useSWR(
    isOrderPopup && product?.id ? '/combo/' + product.id : null,
    fetcher
  )

  const { data: favourites } = useSWR(
    isOrderPopup ? '/your-recommended-products' : null,
    fetcher
  )

  const { isOrdered, productInCart } = useCartProduct(
    product.id,
    currentVariant
  )

  useEffect(() => {
    if (comboData) {
      setComboGroups(comboData.groups)
      if (!currentVariant.length) {
        const variantsMap = []
        comboData.groups?.map((group) => {
          variantsMap.push({
            group_id: group.id,
            quantity: group.quantity,
            variant_id: group.variants[0].id,
          })
        })
        setCurrentVariant(variantsMap)
      }
    }
  }, [comboData, currentVariant.length])

  const addToCartHandler = () => {
    dispatch(
      addToCart({
        price: product.out_price,
        client_id: user ? user.id : '',
        product_id: product.id,
        type: 'combo',
        variants: currentVariant,
        quantity: quantity,
      })
    )
  }

  const onOrderClick = () => {
    addToCartHandler()
    setisOrderPopup(false)
  }

  const onRadioChange = (group_id, variant_id) => {
    setCurrentVariant((prevState) =>
      prevState.map((el) =>
        el.group_id === group_id ? { ...el, variant_id } : el
      )
    )
  }

  const removeHandler = () => {
    dispatch(removeProduct(productInCart?.key))
    setisOrderPopup(false)
    setQuantity(1)
  }

  const removeLastHandler = () => {
    dispatch(removeLastofProduct(product.id))
    setisOrderPopup(false)
    setQuantity(1)
  }

  return (
    <>
      <div
        className={styles.card}
        onClick={() =>
          deliveryType ? setisOrderPopup(true) : dispatch(mapModalHandler(true))
        }
      >
        <div
          className={styles.card_img}
          // onClick={product.active_in_menu ? () => setisOrderPopup(true) : undefined}
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
          {/* {!product.active_in_menu ? (
            <div className={styles.unavailable}>
              {t('temporarily_unavailable')}
            </div>
          ) : null} */}
        </div>
        {/* <div onClick={product.active_in_menu ? () => setisOrderPopup(true) : undefined}> */}
        <div className={styles.card_content}>
          <h4 className={styles.title}>{product.title[router.locale]}</h4>
          <p className={styles.description}>
            {product.description[router.locale].substring(
              0,
              isMobile ? 35 : 55
            ) +
              (product.description[router.locale].length > (isMobile ? 35 : 55)
                ? '...'
                : '')}
          </p>
          <div className={styles.card_actions}>
            <p>
              {numToPrice(product.out_price, '')}
              <span>{t('sum')}</span>
            </p>
            {isOrdered ? (
              <Counter
                className={styles.counter}
                variable={productInCart?.quantity}
                onIncrease={() => dispatch(incrementLastofProduct(product.id))}
                onDecrease={() => {
                  productInCart?.quantity !== 1
                    ? dispatch(decrementLastofProduct(product.id))
                    : removeLastHandler()
                }}
              />
            ) : (
              <Button
                // color={!product.active_in_menu ? 'disabled' : 'secondary'}
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
        productInCart={productInCart}
        product={product}
        setQuantity={setQuantity}
        onOrderClick={onOrderClick}
        removeHandler={removeHandler}
        handleClose={() => setisOrderPopup(false)}
      >
        <div className={styles.dialog_content}>
          {/* {comboGroups.length > 0 &&
            currentVariant.length > 0 &&
            comboGroups?.map((group, idx) => (
              <div key={group.id} className={styles.option_group}>
                <h4>{group.title[router.locale]}</h4>
                <RadioGroup
                  aria-labelledby={group.title['en']}
                  name={group.title['en']}
                  value={currentVariant[idx].variant_id}
                  onChange={(e) => onRadioChange(group.id, e.target.id)}
                >
                  {group?.variants.map((variant) =>
                    group?.type === 'combo_basic' ? (
                      <div key={variant.id}>
                        <FormControlLabel
                          value={variant.title['en']}
                          control={
                            <Radio
                              color="primary"
                              id={variant.id}
                              size="small"
                              sx={{ color: 'var(--lightgray-2)' }}
                              disableRipple
                            />
                          }
                          checked={true}
                          label={variant.title[router.locale]}
                          className={styles.option}
                        />
                        <span>x {group.quantity}</span>
                      </div>
                    ) : (
                      <div key={variant.id}>
                        <FormControlLabel
                          value={variant.title['en']}
                          control={
                            <Radio
                              color="primary"
                              id={variant.id}
                              value={variant.id}
                              size="small"
                              sx={{ color: 'var(--lightgray-2)' }}
                              disableRipple
                            />
                          }
                          label={variant.title[router.locale]}
                          className={styles.option}
                        />
                        <span>x {group.quantity}</span>
                      </div>
                    )
                  )}
                </RadioGroup>
              </div>
            ))} */}
          <div className={styles.option_group}>
            <h4>group title</h4>
            <RadioGroup name={'group.title'}>
              <div>
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
                  label={'variant.title'}
                  className={styles.option}
                />
                <span>x 123</span>
              </div>
              <div>
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
                  label={'variant.title'}
                  className={styles.option}
                />
                <span>x 123</span>
              </div>
            </RadioGroup>
          </div>
          <div className={styles.option_group}>
            <h4>group title</h4>
            <RadioGroup name={'group.title2'}>
              <div>
                <FormControlLabel
                  value={3}
                  control={
                    <Radio
                      color="primary"
                      size="small"
                      sx={{ color: 'var(--lightgray-2)' }}
                      disableRipple
                    />
                  }
                  checked={true}
                  label={'variant.title'}
                  className={styles.option}
                />
                <span>x 123</span>
              </div>
              <div>
                <FormControlLabel
                  value={4}
                  control={
                    <Radio
                      color="primary"
                      size="small"
                      sx={{ color: 'var(--lightgray-2)' }}
                      disableRipple
                    />
                  }
                  label={'variant.title'}
                  className={styles.option}
                />
                <span>x 123</span>
              </div>
            </RadioGroup>
          </div>
        </div>
        {favourites?.length > 0 && (
          <div className={styles.recommended}>
            <h4>{t('something_else?')}</h4>
            <div className={styles.box}>
              <Carousel multiple size="small">
                {favourites?.map((product) => (
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

export default memo(ComboCard)
