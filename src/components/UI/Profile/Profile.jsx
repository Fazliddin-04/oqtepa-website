import { useState, useEffect, memo, useRef } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import dayjs from 'dayjs'

import {
  updateName,
  reset,
  logout,
} from 'store/auth/authSlice'
import { fetcher } from 'utils/fetcher'

import { Container } from '@mui/material'
import Input from '../Input/Input'
import DatePicker from '../Datepicker/DatePicker'
import Button from '../Button/Button'

import styles from './style.module.scss'
import classNames from 'classnames'

function Profile() {
  const { user, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  )

  const { data: userData } = useSWR('/get-your-customer', fetcher)

  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name.split(' ')[0],
    last_name: user?.name.split(' ')[1] ? user?.name.split(' ')[1] : '',
    date_of_birth: user?.date_of_birth ? user?.date_of_birth : '',
    phone: user?.phone,
  })

  const { name, phone, last_name, date_of_birth } = formData
  const { t } = useTranslation('common')
  const dispatch = useDispatch()
  const formRef = useRef(null)
  const previewRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
    if (isSuccess) {
      toast.success(message)
    }

    dispatch(reset())
  }, [isError, isSuccess, message, dispatch])

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    dispatch(updateName(last_name ? name + ' ' + last_name : name))
    setEditing(false)
  }

  const logoutHandler = () => {
    dispatch(logout())
    router.push('/')
  }

  return (
    <div className={styles.profile}>
      <Container>
        <h2>{t('profile')}</h2>
        <div className={styles.box}>
          <h3 className={styles.title}>{t('personal_data')}</h3>
          <form
            className={classNames(styles.form, {
              [styles.active]: editing,
            })}
            ref={formRef}
            onSubmit={onSubmit}
            style={{ transition: '300ms', overflow: 'hidden' }}
          >
            <div className={styles.grid_col_2}>
              <Input
                placeholder={t('name')}
                id="name"
                type="text"
                onChange={onChange}
                value={name}
              />
              <Input
                placeholder={t('last_name')}
                id="last_name"
                type="text"
                onChange={onChange}
                value={last_name}
              />
              <DatePicker
                placeholder={t('date_of_birth')}
                id="date_of_birth"
                onChange={onChange}
                value={date_of_birth}
                max={dayjs().format('YYYY-MM-DD')}
              />
              <Input
                placeholder={t('phone_number')}
                value={phone}
                disabled={true}
              />
            </div>
            <div className={styles.actions}>
              <Button
                color="grayscale"
                size="sm"
                style={{ maxWidth: '135px' }}
                onClick={() => setEditing(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" size="sm" style={{ maxWidth: '135px' }}>
                {t('save')}
              </Button>
            </div>
          </form>
          <div
            ref={previewRef}
            className={classNames(styles.preview, {
              [styles.active]: !editing,
            })}
            style={{ transition: '300ms', overflow: 'hidden' }}
          >
            <div className={styles.grid_col_2}>
              <p>
                {name} {last_name}
              </p>
              <p></p>
              <div>
                <small>{t('date_of_birth')}</small>
                <p>
                  {userData?.dateOfBirth
                    ? dayjs(userData?.dateOfBirth).format('DD.MM.YYYY')
                    : date_of_birth
                    ? dayjs(date_of_birth).format('DD.MM.YYYY')
                    : t('unknown')}
                </p>
              </div>
              <div>
                <small>{t('phone_number')}</small>
                <p>{phone}</p>
              </div>
            </div>
            <div className={styles.edit}>
              <span
                className={styles.edit_text}
                onClick={() => setEditing(true)}
              >
                {t('change_data')}
              </span>
            </div>
          </div>
        </div>
        <button className={styles.logout} onClick={logoutHandler}>
          {t('sign_out')}
        </button>
      </Container>
    </div>
  )
}

export default memo(Profile)
