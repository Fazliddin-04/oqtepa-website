import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
// Redux
import { useDispatch, useSelector } from 'react-redux'
import { addUserLocation, activateAddress } from 'store/common/commonSlice'
// Utils
import useSWR from 'swr'
import { fetcher } from 'utils/fetcher'
// MUI
import FmdGoodIcon from '@mui/icons-material/FmdGood'
import { Container, useMediaQuery, useTheme } from '@mui/material'
// Custom Components
import Navbar from '../Navbar/Navbar'
import Dropdown from '../Dropdown/Dropdown'
import MapDialog from '../MapDialog/MapDialog'
// Style
import classNames from 'classnames'
import styles from './style.module.scss'

export function Header() {
  const [isMapDialog, setIsMapDialog] = useState(false)
  const [activeAddress, setActiveAddress] = useState(null)

  const { t } = useTranslation('common')
  const router = useRouter()
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { user } = useSelector((state) => state.auth)
  const { points, deliveryType, branch } = useSelector((state) => state.common)
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

  useEffect(() => {
    if (deliveryType == 'delivery') {
      if (points.length > 0)
        for (const point of points) {
          if (point.isActive) setActiveAddress(point.address)
        }
    } else if (deliveryType == 'self-pickup') setActiveAddress(branch?.address)
  }, [points, deliveryType, branch])

  return (
    <>
      <header
        className={classNames(styles.header, {
          [styles.mobile]: router.pathname == '/' && isMobile,
        })}
      >
        <Navbar setIsMapDialog={setIsMapDialog}>
          <div className={styles.flexbox_center_between}>
            <div className={styles.wrapper}>
              <Link href="/">
                <a className={styles.logo}>
                  <Image
                    src="/images/bot_logo.png"
                    alt="LOGO"
                    priority={true}
                    objectFit="cover"
                    layout="fill"
                  />
                </a>
              </Link>
              <div className={styles.links}>
                <Link href="/" passHref>
                  <div
                    className={classNames(styles.link, {
                      [styles.active]: router.pathname === '/',
                    })}
                  >
                    {t('menu')}
                  </div>
                </Link>
                {['branches', 'about', 'contacts'].map((link) => (
                  <Link href={`/${link}`} key={link + '_header'} passHref>
                    <div
                      className={classNames(styles.link, {
                        [styles.active]: router.pathname === `/${link}`,
                      })}
                    >
                      {t(link)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className={styles.wrapper}>
              {
                // points.length > 0 ? (
                //   <Dropdown
                //     className={styles.addressButton}
                //     list={points}
                //     type="address"
                //     onSelect={(coords, id) => {
                //       dispatch(addUserLocation(coords))
                //       dispatch(activateAddress(id))
                //     }}
                //     openMap={() => setIsMapDialog(true)}
                //   >
                //     <div
                //       className={styles.addressButton}
                //       onClick={() => {
                //         points.length == 0
                //           ? setIsMapDialog(true)
                //           : !user && setIsMapDialog(true)
                //       }}
                //     >
                //       <div className={styles.icon}>
                //         <FmdGoodIcon fontSize="small" />
                //       </div>
                //       <div>
                //         <p>
                //           {t(
                //             deliveryType === 'self-pickup'
                //               ? 'takeaway_order'
                //               : 'delivery'
                //           )}
                //         </p>
                //         <p className={styles.address}>{activeAddress}</p>
                //       </div>
                //     </div>
                //   </Dropdown>
                // ) :
                activeAddress ? (
                  <div
                    className={styles.addressButton}
                    onClick={() => setIsMapDialog(true)}
                  >
                    <div className={styles.icon}>
                      <FmdGoodIcon fontSize="small" />
                    </div>
                    <div>
                      <p>
                        {t(
                          deliveryType === 'self-pickup'
                            ? 'takeaway_order'
                            : 'delivery'
                        )}
                      </p>
                      <p className={styles.address}>{activeAddress}</p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={styles.addressButton}
                    onClick={() => setIsMapDialog(true)}
                  >
                    <div className={styles.icon}>
                      <FmdGoodIcon fontSize="small" />
                    </div>
                    <div>
                      <p>
                        {t('delivery')} {t('or')} {t('takeaway_order')}
                      </p>
                      <p className={styles.address}>
                        {t('select_the_type_of_reception')}
                      </p>
                    </div>
                  </div>
                )
              }
              <Dropdown
                title="RU"
                list={langs}
                type="lang"
                className={styles.langs}
              />
            </div>
          </div>
        </Navbar>
        {router.pathname == '/' &&
          isMobile &&
          (activeAddress ? (
            <div
              className={styles.mobile_address}
              onClick={() => setIsMapDialog(true)}
            >
              <Container
                sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div className={styles.icon}>
                  <FmdGoodIcon fontSize="small" />
                </div>
                <p>
                  {t(
                    deliveryType === 'self-pickup'
                      ? 'takeaway_order'
                      : 'delivery'
                  )}
                  :{' '}
                  {activeAddress.substring(0, 40) +
                    (activeAddress.length > 40 ? '...' : '')}
                </p>
              </Container>
            </div>
          ) : (
            <div
              className={styles.mobile_address}
              onClick={() => setIsMapDialog(true)}
            >
              <Container
                sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div className={styles.icon}>
                  <FmdGoodIcon fontSize="small" />
                </div>
                <p>
                  {t('delivery')} {t('or')} {t('takeaway_order')}:{' '}
                  {t('select_the_type_of_reception')}
                </p>
              </Container>
            </div>
          ))}
        <MapDialog
          open={isMapDialog}
          title={t('select_the_type_of_reception')}
          handleClose={() => setIsMapDialog(false)}
        />
      </header>
    </>
  )
}
