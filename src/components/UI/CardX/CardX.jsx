import { useState, useEffect, memo, useCallback } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
import { useDispatch, useSelector } from 'react-redux'
import useSWR from 'swr'
// Utils
import { fetcher } from 'utils/fetcher'
import numToPrice from 'utils/numToPrice'
// Redux store
import {
  incrementQuantity,
  decrementQuantity,
  removeProduct,
} from 'store/cart/cartSlice'
// Components
import Counter from '../Counter/Counter'
import FormDialog from '../FormDialog/FormDialog'
import Button from '../Button/Button'
// Style
import classNames from 'classnames'
import styles from './style.module.scss'

function CardX({ product, ordered, size, className, setReProducts, repeat }) {
  const [isDialog, setIsDialog] = useState(false)
  const [variantsInfo, setVariantsInfo] = useState([])

  const router = useRouter()
  const dispatch = useDispatch()
  const { t } = useTranslation('order')
  const { cart } = useSelector((state) => state.cart)

  const { data: variantsData, error: comboErr } = useSWR(
    () =>
      !ordered && product.type === 'combo' && product?.variants
        ? '/your-combo-product-api' + product.product_id
        : null,
    fetcher
  )
  const { data: productData, error: productErr } = useSWR(
    () => (!ordered ? '/your-product-api' + product.product_id : null),
    fetcher
  )

  useEffect(() => {
    if (variantsData && product?.variants) {
      // If products is combo, get info about variants
      let variantMap = []
      variantsData.groups.map((group, idx) => {
        if (group.id === product?.variants[idx].group_id) {
          group.variants.map((variant) => {
            if (variant.id === product?.variants[idx].variant_id) {
              variantMap.push(variant)
            }
          })
        }
      })
      setVariantsInfo(variantMap)
    }
  }, [variantsData, product])

  // useEffect(() => {
  //   if (productErr || comboErr) {
  //     dispatch(removeProduct(product.key))
  //   }
  // }, [comboErr, dispatch, product.key, productErr])

  const onIncrease = () => {
    if (repeat) {
      setReProducts((prevState) =>
        prevState.map((el) =>
          el.key == product?.key ? { ...el, quantity: el.quantity + 1 } : el
        )
      )
    } else dispatch(incrementQuantity(product?.key))
  }

  const onDecrease = () => {
    if (repeat) {
      product.quantity <= 1
        ? setIsDialog(true)
        : setReProducts((prevState) =>
            prevState.map((el) =>
              el.key == product?.key ? { ...el, quantity: el.quantity - 1 } : el
            )
          )
    } else
      product.quantity <= 1
        ? setIsDialog(true)
        : dispatch(decrementQuantity(product?.key))
  }

  const removeHandler = () => {
    if (repeat) {
      setReProducts((prevState) =>
        prevState.filter((el) => el.key != product?.key)
      )
    } else {
      dispatch(removeProduct(product?.key))
    }
    setIsDialog(false)
  }

  return (
    <>
      <div
        className={classNames(styles.cardX, {
          [styles.sm]: size === 'sm',
          [styles.md]: size === 'md',
          [className]: className,
        })}
      >
        <div className={styles.cardX_img}>
          {!ordered && productData ? (
            <Image
              src={
                productData?.image
                  ? process.env.BASE_URL + productData?.image
                  : '/images/bot_logo.png'
              }
              alt={ordered ? product?.name : productData?.title[router.locale]}
              objectFit="cover"
              layout="fill"
              priority={true}
            />
          ) : (
            ordered &&
            product?.image && (
              <Image
                src={
                  ordered && product?.image
                    ? process.env.BASE_URL + product?.image
                    : process.env.BASE_URL +
                      '9440048a-fe6b-4be7-9541-d94d2a8d1951'
                }
                alt={
                  ordered ? product?.name : productData?.title[router.locale]
                }
                objectFit="cover"
                layout="fill"
                priority={true}
              />
            )
          )}
        </div>
        <div className={styles.content}>
          <div>
            <h4
              className={classNames(styles.title, {
                [styles.loading]: productData == null && !ordered,
              })}
            >
              {ordered ? (
                <>
                  {product?.name}
                  <br />
                  {product?.quantity} {t('pcs')}
                </>
              ) : (
                productData?.title && productData?.title[router.locale]
              )}
            </h4>
            {!ordered && (
              <p
                className={classNames(styles.description, {
                  [styles.loading]:
                    (ordered && !product) || (!ordered && !productData),
                })}
              >
                {variantsInfo.length > 0 &&
                  variantsInfo.map((variant, idx) => (
                    <span
                      key={
                        product?.variants[idx].group_id +
                        product?.variants[idx].variant_id
                      }
                    >
                      <span style={{ marginLeft: 5 }}>
                        {variant.title[router.locale]} x{' '}
                        {product?.variants[idx].variant_id === variant.id &&
                          product?.variants[idx].quantity}
                      </span>
                      <br />
                    </span>
                  ))}
                {!variantsInfo.length &&
                  productData?.description &&
                  productData?.description[router.locale].substring(0, 120) +
                    (productData?.description[router.locale].length > 120
                      ? '...'
                      : '')}
              </p>
            )}
          </div>
          <div className={styles.actions}>
            {!ordered && (
              <Counter
                className={styles.counter}
                variable={product?.quantity}
                onDecrease={onDecrease}
                onIncrease={onIncrease}
              />
            )}
            <p className={styles.price}>
              {ordered
                ? numToPrice(product?.total_amount, t('sum'))
                : numToPrice(productData?.out_price, t('sum'))}
            </p>
          </div>
        </div>
      </div>
      <FormDialog
        open={isDialog}
        title={t('attention')}
        descr={t('are_you_sure-product')}
        handleClose={() => setIsDialog(false)}
      >
        <div className={styles.flexbox}>
          <Button color="grayscale" onClick={() => setIsDialog(false)}>
            {t('no')}
          </Button>
          <Button onClick={() => removeHandler()}>{t('yes')}</Button>
        </div>
      </FormDialog>
    </>
  )
}

export default memo(CardX)
