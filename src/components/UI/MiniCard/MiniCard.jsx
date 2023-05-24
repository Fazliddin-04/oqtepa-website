import { useState, memo } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import Image from 'next/image'
// Redux store
import {
  removeProduct,
  addToCart,
  incrementQuantity,
  decrementQuantity,
} from 'store/cart/cartSlice'
// Hooks
import useCartProduct from 'hooks/useCartProduct'
// Utils
import numToPrice from 'utils/numToPrice'
// Components
import Button from '../Button/Button'
import Counter from '../Counter/Counter'
import OrderDialog from '../OrderDialog/OrderDialog'
import ModifierCheckbox from '../ModifierCheckbox/ModifierCheckbox'
// Style
import classNames from 'classnames'
import styles from './style.module.scss'

function MiniCard({ product, size }) {
  const [quantity, setQuantity] = useState(1)
  const [isOrderPopup, setisOrderPopup] = useState(false)

  const dispatch = useDispatch()
  const router = useRouter()
  const { t } = useTranslation('common')
  const { user } = useSelector((state) => state.auth)
  const { deliveryType } = useSelector((state) => state.common)

  const { isOrdered, productInCart } = useCartProduct(product.id)

  const clickHandler = () => {
    if (deliveryType) addToCartHandler()
    else dispatch(mapModalHandler(true))
  }

  const addToCartHandler = () => {
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
  }

  const onOrderClick = () => {
    addToCartHandler()
    setisOrderPopup(false)
  }

  const removeHandler = () => {
    dispatch(removeProduct(productInCart.key))
    setisOrderPopup(false)
    setQuantity(1)
  }

  return (
    <>
      <div
        className={classNames(styles.card, { [styles.small]: size == 'small' })}
      >
        <div className={styles.card_img} onClick={() => setisOrderPopup(true)}>
          <Image
            src={
              product.image
                ? process.env.BASE_URL + product.image
                : '/images/bot_logo.png'
            }
            alt={product.title[router.locale]}
            layout="fill"
            objectFit="cover"
            priority={true}
          />
        </div>
        <div className={styles.content}>
          <div onClick={() => setisOrderPopup(true)}>
            <h4 className={styles.title}>{product.title[router.locale]}</h4>
            <p className={styles.description}>
              {product.description[router.locale]}
            </p>
          </div>
          <div className={styles.actions}>
            {isOrdered ? (
              <div className={styles.counter}>
                <Counter
                  variable={productInCart.quantity}
                  onIncrease={() =>
                    dispatch(incrementQuantity(productInCart?.key))
                  }
                  onDecrease={() => {
                    productInCart.quantity > 1
                      ? dispatch(decrementQuantity(productInCart?.key))
                      : removeHandler()
                  }}
                  className={styles.counter}
                />
              </div>
            ) : (
              <Button
                color="grayscale-hover"
                size={size == 'small' && 'sm'}
                onClick={clickHandler}
              >
                {numToPrice(product.out_price, t('sum'))}
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
        <div className={styles.dialog_content}>
          {/* {modifiers?.single_modifiers &&
            modifiers?.single_modifiers.map((modifier) => (
              <div
                key={modifier.id + modifier.from_product_id}
                className={styles.single_modifier}
              >
                <h4>{modifier.category_name[router.locale]}</h4>
                <ModifierCheckbox
                  checked={checkModifierHandler(modifier?.id)}
                  quantity={modifierQuantityHandler(modifier?.id) * quantity}
                  name={modifier.name['en']}
                  onChange={({ target }) =>
                    onModifierChange(
                      target.checked,
                      modifier,
                      setOrderModifiers
                    )
                  }
                  label={modifier.name[router.locale]}
                  outPrice={modifier.price}
                  isCompulsory={modifier.is_compulsory}
                  decrease={() =>
                    onDecreaseModifierQuantity(
                      modifier,
                      orderModifiers,
                      setOrderModifiers
                    )
                  }
                  increase={() =>
                    onIncreaseModifierQuantity(
                      modifier,
                      orderModifiers,
                      setOrderModifiers
                    )
                  }
                  single
                />
              </div>
            ))} */}
          {/* Sample below */}
          <div className={styles.single_modifier}>
            <h4>modifier.category_name</h4>
            <ModifierCheckbox
              quantity={1 * quantity}
              name={'modifier.name'}
              label={'modifier.name'}
              outPrice={12345}
              isCompulsory={false}
              single
            />
          </div>
          {/* Sample above */}
          {/* {modifiers?.group_modifiers &&
            modifiers?.group_modifiers.map(
              (modifier, idx) =>
                modifiersQuantity[idx]?.id === modifier.id && (
                  <div
                    key={modifier.id + modifier.from_product_id}
                    className={styles.modifier_group}
                  >
                    <h4>{modifier.name[router.locale]}</h4>
                    {modifier?.variants.map((variant) => (
                      <div key={variant.id}>
                        <ModifierCheckbox
                          checked={checkModifierHandler(variant?.id)}
                          quantity={
                            modifierQuantityHandler(variant?.id) * quantity
                          }
                          name={variant.title['en']}
                          onChange={({ target }) =>
                            onGroupModifierChange(
                              target.checked,
                              variant,
                              modifier,
                              orderModifiers,
                              setOrderModifiers,
                              modifiersQuantity,
                              setModifiersQuantity
                            )
                          }
                          label={variant.title[router.locale]}
                          outPrice={variant.out_price}
                          decrease={() =>
                            onDecreaseModifierVariantQuantity(
                              variant,
                              modifier,
                              orderModifiers,
                              setOrderModifiers,
                              modifiersQuantity,
                              setModifiersQuantity
                            )
                          }
                          increase={() =>
                            onIncreaseModifierVariantQuantity(
                              variant,
                              modifier,
                              orderModifiers,
                              setOrderModifiers,
                              modifiersQuantity,
                              setModifiersQuantity
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                )
            )} */}
          {/* Sample below */}
          <div className={styles.modifier_group}>
            <h4>modifier.name</h4>
            <div>
              <ModifierCheckbox
                quantity={1 * quantity}
                name={'variant.title'}
                label={'variant.title'}
                outPrice={12000}
              />
            </div>
          </div>
          {/* Sample above */}
        </div>
      </OrderDialog>
    </>
  )
}

export default memo(MiniCard)
