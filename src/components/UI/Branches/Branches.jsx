import { useState, useRef, memo, forwardRef } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'
// Redux store
import { branchIdHandler, deliveryTypeHandler } from 'store/common/commonSlice'
// Yandex Maps
import { YMaps, Map, Placemark, Clusterer } from '@pbe/react-yandex-maps'
// MUI
import {
  Container,
  IconButton,
  Dialog,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
// Components
import GroupButton from '../GroupButton/GroupButton'
import Button from '../Button/Button'
// Style
import styles from './style.module.scss'
import classNames from 'classnames'
import { useRouter } from 'next/router'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function Branches({ branches }) {
  const [branchData, setBranchData] = useState(null)
  const [isMapOpen, setIsMapOpen] = useState(false)

  const mapRef = useRef(null)
  const dispatch = useDispatch()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { t } = useTranslation('branches')
  const { location, deliveryType } = useSelector((state) => state.common)
  const currentTime = dayjs().format('HH:mm')

  // Get branch schedule status
  const scheduleStatus = (branch) => {
    if (branch && branch.work_hour_start && branch.work_hour_end) {
      return branch.work_hour_start < currentTime &&
        currentTime < branch.work_hour_end ? (
        <p style={{ color: '#5AC53A' }}>
          {t('open_until', {
            work_hour_end: branch.work_hour_end,
          })}
        </p> // current time is between work hours
      ) : branch.work_hour_start < currentTime &&
        branch.work_hour_end < currentTime &&
        branch.work_hour_end < branch.work_hour_start ? (
        <p style={{ color: '#5AC53A' }}>
          {t('open_until', {
            work_hour_end: branch.work_hour_end,
          })}
        </p> // current time is between work hours and work hour end is next day
      ) : branch.work_hour_end > currentTime &&
        branch.work_hour_start > currentTime &&
        branch.work_hour_end < branch.work_hour_start ? (
        <p style={{ color: '#5AC53A' }}>
          {t('open_until', {
            work_hour_end: branch.work_hour_end,
          })}
        </p>
      ) : branch.work_hour_start == '00:00' &&
        branch.work_hour_end == '23:59' ? (
        <p style={{ color: '#5AC53A' }}>{t('works_around_the_clock')}</p> // works around the clock
      ) : (
        <p style={{ color: '#f00' }}>
          {t('closed_until', {
            work_hour_start: branch.work_hour_start,
          })}
        </p> // current time is before work hour start and branch work hour ended
      )
    }
  }

  const onPickup = () => {
    dispatch(
      branchIdHandler({
        id: branchData.id,
        address: branchData.address,
        name: branchData.name,
        location: branchData.location,
      })
    )
    dispatch(deliveryTypeHandler('self-pickup'))
    setBranchData(null)
    router.push('/cart')
  }

  return (
    <div className={styles.branches}>
      <Container>
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>{t('branches')}</h2>
            <div className={styles.group_buttons}>
              <GroupButton
                color="primary"
                size="md"
                active={!isMapOpen}
                onClick={() => setIsMapOpen(false)}
              >
                {t('list')}
              </GroupButton>
              <GroupButton
                color="primary"
                size="md"
                active={isMapOpen}
                onClick={() => setIsMapOpen(true)}
              >
                {t('map')}
              </GroupButton>
            </div>
          </div>

          <div
            className={classNames(styles.list, {
              [styles.unvisible]: isMapOpen,
            })}
          >
            {branches?.map((branch) => (
              <div className={styles.card} key={branch.id}>
                <div className={styles.flex}>
                  <div>
                    <h4 className={styles.title}>{branch.name}</h4>
                    <p>
                      {branch.address ? branch.address : branch.destination}
                    </p>
                  </div>
                  <div>{scheduleStatus(branch)}</div>
                </div>
                <div className={styles.flex}>
                  <div>
                    <p className={styles.text_light}>{t('schedule')}:</p>
                    <p>
                      {t('mon-sun')}: {branch.work_hour_start}-
                      {branch.work_hour_end}
                    </p>
                  </div>
                  {branch.phone.trim() && (
                    <div>
                      <p className={styles.text_light}>{t('phone')}:</p>
                      <p>
                        <a
                          href={`tel:${branch.phone.trim()}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {branch.phone}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
      <div className={classNames(styles.map, { [styles.visible]: isMapOpen })}>
        <Container sx={{ position: 'relative' }}>
          <div
            className={classNames(styles.box, {
              [styles.visible]: branchData && !isMobile,
            })}
          >
            <div className={styles.box_header}>
              {scheduleStatus(branchData)}
              <h4 className={styles.box_header_title}>
                {branchData?.name}
                {branchData?.address &&
                  `, ${branchData?.address.replace('Узбекистан,', '')}`}
              </h4>
              {branchData?.destination && <p>{branchData?.destination}</p>}
            </div>
            <div className={styles.box_content}>
              <div>
                <small>{t('schedule')}:</small>
                <p>
                  {t('mon-sun')}: {branchData?.work_hour_start}-
                  {branchData?.work_hour_end}
                </p>
              </div>
              {branchData?.phone.trim() && (
                <div>
                  <small>{t('phone')}:</small>
                  <p>
                    <a
                      href={`tel:${branchData?.phone.trim()}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {branchData?.phone}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
        <YMaps
          query={{
            load: 'Map,Placemark',
          }}
        >
          <Map
            defaultState={{
              center: [41.321501, 69.233015],
              zoom: 13,
            }}
            instanceRef={mapRef}
            style={{
              overflow: 'hidden',
              borderRadius: 12,
              width: '100%',
              height: '100%',
            }}
            modules={['Placemark']}
          >
            <Clusterer
              options={{
                preset: 'islands#invertedRedClusterIcons',
                groupByCoordinates: false,
              }}
            >
              {branches?.map((branch) => (
                <Placemark
                  key={branch.id}
                  geometry={[branch.location.lat, branch.location.long]}
                  options={{
                    iconLayout: 'default#image',
                    // Custom image for the placemark icon.
                    iconImageHref: '/images/pin_oqtepa.svg',
                    // The size of the placemark.
                    iconImageSize: [50, 50],
                    iconImageOffset: [-25, -50],
                  }}
                  // style={}
                  properties={{
                    iconCaption: branch.name,
                  }}
                  onClick={() => {
                    mapRef &&
                      mapRef.current?.setCenter(
                        [branch.location.lat, branch.location.long],
                        18,
                        {
                          duration: 300,
                        }
                      )
                    setBranchData(branch)
                  }}
                />
              ))}
            </Clusterer>
            {deliveryType == 'delivery' && location && (
              <Placemark
                geometry={[location[0], location[1]]}
                options={{
                  preset: 'islands#redStretchyIcon',
                }}
                properties={{
                  iconContent: 'Я',
                }}
              />
            )}
          </Map>
        </YMaps>
      </div>
      <Dialog
        open={(branchData && isMobile) || false}
        onClose={() => setBranchData(null)}
        className={styles.dialog}
        fullScreen={true}
        TransitionComponent={Transition}
      >
        <div className={styles.dialog_content}>
          <div className={styles.dialog_content_header}>
            <div className={styles.flexbox_center_between}>
              {scheduleStatus(branchData)}
              <IconButton
                onClick={() => setBranchData(null)}
                className={styles.iconButton}
              >
                <CloseRoundedIcon />
              </IconButton>
            </div>
            <h4 className={styles.dialog_content_header_title}>
              {branchData?.name}
              {branchData?.address &&
                `, ${branchData?.address.replace('Узбекистан,', '')}`}
            </h4>
            {branchData?.destination && <p>{branchData?.destination}</p>}
          </div>
          <div className={styles.div}>
            <small>{t('schedule')}:</small>
            <p>
              {t('mon-sun')}: {branchData?.work_hour_start}-
              {branchData?.work_hour_end}
            </p>
          </div>
          {branchData?.phone.trim() && (
            <div className={styles.div}>
              <small>{t('phone')}:</small>
              <p>
                <a
                  href={`tel:${branchData?.phone.trim()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {branchData?.phone}
                </a>
              </p>
            </div>
          )}
        </div>
        <div>
          <Button style={{ width: '100%' }} onClick={onPickup}>
            {t('order_pickup')}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

export default memo(Branches)
