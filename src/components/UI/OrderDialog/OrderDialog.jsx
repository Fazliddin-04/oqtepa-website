import { forwardRef, memo } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
import { useDispatch } from 'react-redux'
// Utils & Redux store
import numToPrice from 'utils/numToPrice'
import { incrementQuantity, decrementQuantity } from 'store/cart/cartSlice'
// MUI
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
// Component
import Counter from '../Counter/Counter'
import Button from '../Button/Button'
// Styles
import styles from './style.module.scss'
import classNames from 'classnames'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function OrderDialog({
  open,
  product,
  productInCart,
  isOrdered,
  quantity,
  handleClose,
  setQuantity,
  removeHandler,
  onOrderClick,
  modifiersPrice,
  children,
}) {
  const { t } = useTranslation('common')
  const dispatch = useDispatch()
  const router = useRouter()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className={classNames(styles.dialog, {
        [styles.mobile]: isMobile,
        [styles.desktop]: !isMobile,
      })}
      maxWidth="md"
      fullScreen={isMobile}
      TransitionComponent={Transition}
    >
      <div className={!isMobile ? styles.flexbox : ''}>
        <div
          className={classNames(styles.image, {
            [styles.loading]: product == null,
          })}
        >
          {product && (
            <Image
              src={
                product?.image
                  ? process.env.BASE_URL + product?.image
                  : '/images/bot_logo.png'
              }
              alt={product?.title[router.locale]}
              layout="fill"
              objectFit="contain"
            />
          )}
        </div>
        <div className={styles.content}>
          <div className={styles.content_wrapper}>
            <DialogTitle
              className={classNames(styles.title, {
                [styles.loading]: product == null,
              })}
            >
              {product?.title[router.locale]}
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                className={classNames(styles.descr, {
                  [styles.loading]: product == null,
                })}
              >
                {product?.description[router.locale]}
              </DialogContentText>
              {product == null && <div className={styles.loading_text}></div>}
              {product == null && <div className={styles.loading_text}></div>}
              {children}
            </DialogContent>
          </div>
          <DialogActions className={styles.actions}>
            <Counter
              variable={
                productInCart?.quantity ? productInCart.quantity : quantity
              }
              onIncrease={() =>
                productInCart?.quantity
                  ? dispatch(incrementQuantity(productInCart?.key))
                  : setQuantity((prevState) => ++prevState)
              }
              onDecrease={() => {
                productInCart?.quantity && isOrdered
                  ? productInCart.quantity > 1
                    ? dispatch(decrementQuantity(productInCart?.key))
                    : removeHandler()
                  : quantity > 1
                  ? setQuantity((prevState) => --prevState)
                  : setQuantity(1)
              }}
              className={styles.counter}
            />
            {isOrdered ? (
              <Button
                style={{ justifyContent: 'space-between' }}
                color="disabled"
              >
                {isMobile && t('added')}
                <p>
                  {!isMobile && t('added')}{' '}
                  {numToPrice(
                    productInCart?.quantity
                      ? modifiersPrice
                        ? productInCart.quantity * product?.out_price +
                          modifiersPrice * productInCart.quantity
                        : productInCart.quantity * product?.out_price
                      : modifiersPrice
                      ? quantity * product?.out_price +
                        modifiersPrice * quantity
                      : quantity * product?.out_price,
                    t('sum')
                  )}
                </p>
              </Button>
            ) : (
              <Button
                style={{ justifyContent: 'space-between' }}
                onClick={() => product && onOrderClick()}
                color={product ? 'primary' : 'disabled'}
              >
                {isMobile && t('add')}
                <p>
                  {!isMobile && t('add')}{' '}
                  {numToPrice(
                    productInCart?.quantity
                      ? modifiersPrice
                        ? productInCart.quantity * product?.out_price +
                          modifiersPrice * productInCart.quantity
                        : productInCart.quantity * product?.out_price
                      : modifiersPrice
                      ? quantity * product?.out_price +
                        modifiersPrice * quantity
                      : product
                      ? quantity * product?.out_price
                      : 0,
                    t('sum')
                  )}
                </p>
              </Button>
            )}
          </DialogActions>
        </div>
      </div>
      {!isMobile && (
        <IconButton onClick={handleClose} className={styles.closeIcon}>
          <CloseIcon />
        </IconButton>
      )}
    </Dialog>
  )
}

export default memo(OrderDialog)
