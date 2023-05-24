import { useState, useEffect, useCallback } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
// Redux store
import { reset, updateName } from 'store/auth/authSlice'
// Components
import Countdown from '../Countdown/Countdown'
import Input from '../Input/Input'
import Button from '../Button/Button'
import FormDialog from '../FormDialog/FormDialog'
// Style
import styles from './style.module.scss'

function AuthDialog({ open, handleClose }) {
  const [otpDialog, setOtpDialog] = useState(false)
  const [nameDialog, setNameDialog] = useState(false)
  const [countReset, setCountReset] = useState(true)
  const [otp, setOtp] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [name, setName] = useState('')
  const [phoneError, setPhoneError] = useState(false)
  const [otpError, setOtpError] = useState(false)
  const [nameError, setNameError] = useState(false)
  const [btnDisabled, setBtnDisabled] = useState(false)

  const router = useRouter()
  const { pathname, query } = router

  const onClose = useCallback(() => {
    if (query.login) {
      const params = new URLSearchParams(query)
      params.delete('login')
      router.replace({ pathname, query: params.toString() }, undefined, {
        shallow: true,
      })
    }
    handleClose()
    setOtp('')
    setPhoneNumber('')
    setName('')
    setOtpDialog(false)
    setNameDialog(false)
  }, [pathname, query, router, handleClose])

  const { t } = useTranslation('common')
  const dispatch = useDispatch()

  const { user, isError, message, isLoading } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (isError) {
      setOtpError(true)
    }

    if (isLoading) {
      setBtnDisabled(true)
    } else {
      setBtnDisabled(false)
    }

    if (user) {
      // Redirect when logged in
      if (user?.name !== '') {
        onClose()
      } else {
        setNameDialog(true)
      }
    } else {
      setNameDialog(false)
    }

    dispatch(reset())
  }, [isError, user, message, dispatch, open, isLoading, onClose])

  useEffect(() => {
    if (otpDialog) {
      setTimeout(() => {
        setCountReset(false)
      }, 60000)
    }

    return () => {
      setCountReset(true)
    }
  }, [otpDialog])

  const onOtpChange = (e) => {
    const txt = e.target.value
    // prevent more than 12 characters, ignore the spacebar, allow the backspace
    if ((txt.length == 6 || e.which == 32) & (e.which !== 8)) e.preventDefault()
    // add spaces after 3 & 7 characters, allow the backspace
    e.target.value.length <= 6 ? setOtp(e.target.value) : setOtp(otp)
    setOtpError(false)
  }

  const onTelChange = (e) => {
    if (e.target.value.length < 13) {
      setPhoneError(false)
      setPhoneNumber(e.target.value)
    }
  }

  const onTelSubmit = (e) => {
    e.preventDefault()
    if (!btnDisabled) {
      if (phoneNumber.replace(' ', '').length >= 11) {
        setOtpDialog(true)
      } else setPhoneError(true)
    }
  }

  const onOTPSubmit = (e) => {
    e.preventDefault()
    if (!btnDisabled) {
      if (otp.length == 6) {
        console.log({
          code: otp,
          phone: '+998' + phoneNumber.replaceAll(' ', ''),
        })
      }
    }
  }

  const onNameSubmit = (e) => {
    e.preventDefault()
    if (!btnDisabled) {
      if (name.length > 0) {
        dispatch(updateName(name))
        setNameDialog(false)
        handleClose()
      } else setNameError(true)
    }
  }

  const onCountReset = () => {
    setCountReset(true)
    setTimeout(() => {
      setCountReset(false)
    }, 60000)
  }

  return (
    <FormDialog
      open={open}
      title={t('sign_in')}
      descr={t('sign_in_with_your_phone_number')}
      handleClose={onClose}
      usedFor="auth"
      modalType="xs"
      className={styles.authDialog}
    >
      {!nameDialog ? (
        <>
          <form onSubmit={onTelSubmit}>
            <Input
              label={t('phone_number')}
              type="tel"
              onChange={onTelChange}
              value={phoneNumber}
              disabled={otpDialog || btnDisabled}
              isError={phoneError}
              errorMessage={t('wrong_phone_entered')}
            />
            {!otpDialog && (
              <div className={styles.buttonWrapper}>
                <Button
                  type={btnDisabled ? 'disabled' : 'submit'}
                  color={phoneNumber.replace(' ', '').length < 11 && 'disabled'}
                >
                  {t('send_code')}
                </Button>
              </div>
            )}
          </form>
          {otpDialog && (
            <form onSubmit={onOTPSubmit} className={styles.otp_form}>
              <Input
                label={t('confirmation_code')}
                id="otp"
                type="number"
                onChange={(e) =>
                  !/[A-Z]/i.test(e.target.value) && onOtpChange(e)
                }
                value={otp}
                isError={otpError}
                errorMessage={t('wrong_code_entered')}
              />
              <div className={styles.countdownWrapper}>
                {otpDialog && countReset ? (
                  <Countdown value={60} />
                ) : (
                  <p className={styles.buttonText} onClick={onCountReset}>
                    {t('send_again')}
                  </p>
                )}
              </div>
              <div className={styles.buttonWrapper}>
                <Button
                  type={btnDisabled ? 'disabled' : 'submit'}
                  color={otp.length < 6 && 'disabled'}
                >
                  {t('confirm')}
                </Button>
              </div>
            </form>
          )}
        </>
      ) : (
        <form onSubmit={onNameSubmit}>
          <Input
            label={t('name')}
            id="name"
            type="text"
            placeholder={t('enter_your_name')}
            onChange={(e) => {
              setName(e.target.value)
              setNameError(false)
            }}
            value={name}
            isError={nameError}
            errorMessage={t('enter_your_name')}
          />
          <div className={styles.buttonWrapper}>
            <Button type="submit">{t('confirm')}</Button>
          </div>
        </form>
      )}
    </FormDialog>
  )
}

export default AuthDialog
