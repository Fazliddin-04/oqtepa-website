import { useSelector } from 'react-redux'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import Link from 'next/link'
// MUI
import { IconButton } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
// Custom Components
import Dropdown from '../Dropdown/Dropdown'
// Style
import styles from './style.module.scss'
import classNames from 'classnames'

export default function Drawer({ open, handleClose, login }) {
  const langs = [
    {
      key: 'uz',
      label: "O'zbekcha",
    },
    {
      key: 'ru',
      label: 'Русский',
    },
    {
      key: 'en',
      label: 'English',
    },
  ]

  const { t } = useTranslation('common')
  const router = useRouter()

  const { user } = useSelector((state) => state.auth)

  return (
    <>
      <div
        className={classNames(styles.drawer, {
          [styles.visible]: open == true,
        })}
      >
        <div className={styles.drawer_top}>
          <h3>{t('menu')}</h3>
          <IconButton
            aria-label="Close Menu"
            onClick={handleClose}
            className={styles.iconButton}
          >
            <CloseRoundedIcon />
          </IconButton>
        </div>
        <div className={styles.details}>
          <div className={styles.langs}>
            <Dropdown list={langs} type="lang" fullWidth border />
          </div>
          <div className={styles.user_details}>
            {user ? (
              <>
                <div className={styles.flexbox_align_center}>
                  <div className={styles.icon}>
                    {/* User Icon */}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 10.5C12.9663 10.5001 13.8954 10.8732 14.5933 11.5415C15.2913 12.2098 15.7043 13.1218 15.7463 14.0873L15.75 14.25V15C15.7501 15.3784 15.6072 15.7429 15.3499 16.0204C15.0926 16.2979 14.7399 16.4679 14.3625 16.4963L14.25 16.5H3.75C3.37157 16.5001 3.00708 16.3572 2.72959 16.0999C2.4521 15.8426 2.28213 15.4899 2.25375 15.1125L2.25 15V14.25C2.25006 13.2837 2.62316 12.3546 3.29149 11.6567C3.95983 10.9587 4.87181 10.5457 5.83725 10.5037L6 10.5H12ZM9 1.5C9.99456 1.5 10.9484 1.89509 11.6517 2.59835C12.3549 3.30161 12.75 4.25544 12.75 5.25C12.75 6.24456 12.3549 7.19839 11.6517 7.90165C10.9484 8.60491 9.99456 9 9 9C8.00544 9 7.05161 8.60491 6.34835 7.90165C5.64509 7.19839 5.25 6.24456 5.25 5.25C5.25 4.25544 5.64509 3.30161 6.34835 2.59835C7.05161 1.89509 8.00544 1.5 9 1.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  {user?.name}
                </div>
                <Link href="/profile" passHref>
                  <div
                    className={classNames(styles.list_item, {
                      [styles.active]: router.pathname === '/profile',
                      [styles.mobile]: true,
                    })}
                    onClick={handleClose}
                  >
                    {t('profile')}{' '}
                    {router.pathname === '/profile' && (
                      <span>
                        <CheckRoundedIcon />
                      </span>
                    )}
                  </div>
                </Link>
                <Link href="/myorders" passHref>
                  <div
                    className={classNames(styles.list_item, {
                      [styles.active]: router.pathname === '/myorders',
                      [styles.mobile]: true,
                    })}
                    onClick={handleClose}
                  >
                    {t('my_orders')}{' '}
                    {router.pathname === '/myorders' && (
                      <span>
                        <CheckRoundedIcon />
                      </span>
                    )}
                  </div>
                </Link>
                <Link href="/myaddresses" passHref>
                  <div
                    className={classNames(styles.list_item, {
                      [styles.active]: router.pathname === '/myaddresses',
                      [styles.mobile]: true,
                    })}
                    onClick={handleClose}
                  >
                    {t('my_address')}{' '}
                    {router.pathname === '/myaddresses' && (
                      <span>
                        <CheckRoundedIcon />
                      </span>
                    )}
                  </div>
                </Link>
              </>
            ) : (
              <div
                className={`${styles.list_item} ${styles.no_signed}`}
                onClick={() => {
                  handleClose()
                  login()
                }}
              >
                {t('log_in')}
              </div>
            )}
          </div>
          <Link href="/" passHref>
            <div
              className={classNames(styles.list_item, {
                [styles.active]: router.pathname === '/',
                [styles.mobile]: true,
              })}
              onClick={handleClose}
            >
              {t('home')}{' '}
              {router.pathname === '/' && (
                <span>
                  <CheckRoundedIcon />
                </span>
              )}
            </div>
          </Link>
          {['branches', 'about', 'contacts'].map((link) => (
            <Link href={`/${link}`} key={link + 777} passHref>
              <div
                className={classNames(styles.list_item, {
                  [styles.active]: router.pathname === `/${link}`,
                })}
                onClick={handleClose}
              >
                {t(link)}{' '}
                {router.pathname === `/${link}` && (
                  <span>
                    <CheckRoundedIcon />
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div
        className={styles.shadow}
        style={{
          opacity: open ? 1 : 0,
          width: open ? '100vw' : '0vw',
        }}
        onClick={handleClose}
      ></div>
    </>
  )
}
