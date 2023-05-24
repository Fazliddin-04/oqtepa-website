import { useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
// Utils
import numToPrice from 'utils/numToPrice'
// Components
import Button from '../Button/Button'
import AuthDialog from '../AuthDialog/AuthDialog'
import FormDialog from '../FormDialog/FormDialog'
// Style
import styles from './style.module.scss'

function Bill({ totalPrice, validate, deliveryPrice, minPrice, onSubmit }) {
  const [isAuthDialog, setIsAuthDialog] = useState(false)
  const [isOrderConfirm, setIsOrderConfirm] = useState(false)

  const { user } = useSelector((state) => state.auth)

  const router = useRouter()
  const { t } = useTranslation('order')

  const onButtonClick = () => {
    if (router.pathname == '/cart') {
      user && user.name ? router.push('/checkout') : setIsAuthDialog(true)
    } else validate && setIsOrderConfirm(true)
  }

  return (
    <>
      <div className={styles.bill}>
        <h4> {t('total')}</h4>
        <div className={styles.text}>
          {t('products')} <span>{numToPrice(totalPrice, t('sum'))}</span>
        </div>
        <div className={styles.text}>
          {t('delivery')} <span>{numToPrice(deliveryPrice, t('sum'))}</span>
        </div>
        <div className={styles.action}>
          <div className={styles.text}>
            {t('to_pay')}{' '}
            <span>{numToPrice(totalPrice + deliveryPrice, t('sum'))}</span>
          </div>
          {minPrice <= totalPrice ? (
            <Button type="submit" onClick={onButtonClick}>
              {router.pathname === '/cart'
                ? t('go_to_checkout')
                : t('checkout_order')}
            </Button>
          ) : (
            <>
              <Button color="disabled">
                {router.pathname === '/cart'
                  ? t('go_to_checkout')
                  : t('checkout_order')}
              </Button>
              <p>
                {t('minimum_order_amount_must_be', {
                  price: numToPrice(minPrice, t('sum')),
                })}
              </p>
            </>
          )}
        </div>
      </div>
      <AuthDialog
        open={isAuthDialog}
        handleClose={() => setIsAuthDialog(false)}
      />
      <FormDialog
        open={isOrderConfirm}
        title={t('attention')}
        descr={t('are_you_sure-order')}
        handleClose={() => setIsOrderConfirm(false)}
      >
        <div className={styles.flexbox}>
          <Button color="grayscale" onClick={() => setIsOrderConfirm(false)}>
            {t('no')}
          </Button>
          <Button type="submit" onClick={onSubmit}>
            {t('yes')}
          </Button>
        </div>
      </FormDialog>
    </>
  )
}

export default Bill
