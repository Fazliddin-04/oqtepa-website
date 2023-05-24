import { useState, useEffect, useRef, forwardRef, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useTranslation from 'next-translate/useTranslation'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import useSWR from 'swr'
// MUI
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  useMediaQuery,
  RadioGroup,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
// Actions
import {
  addUserLocation,
  savePoint,
  updatePoint,
  mapModalHandler,
  activateAddress,
  deliveryTypeHandler,
  branchIdHandler,
} from 'store/common/commonSlice'
import { fetcher } from 'utils/fetcher'
// Components
import {
  YMaps,
  Map,
  Placemark,
  GeolocationControl,
  Clusterer,
} from '@pbe/react-yandex-maps'
import Button from '../Button/Button'
import CustomRadio from '../CustomRadio/CustomRadio'
// styles
import classNames from 'classnames'
import styles from './style.module.scss'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function CustomSearchControl({
  placeholder,
  addressName,
  apikey,
  deliveryType,
  branches,
  setAddressName,
  setActiveBranch,
  setPoisition,
  setPlacemarkCoords,
}) {
  const [ymapSearchResults, setYmapSearchResults] = useState([])
  const [activeResultIdx, setActiveResultIdx] = useState(0)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [branchSearch, setBranchSearch] = useState('')

  useEffect(() => {
    const getAddressResults = async () => {
      try {
        if (addressName) {
          const response = await fetch(
            `https://geocode-maps.yandex.ru/1.x/?apikey=${apikey}&format=json&geocode=${addressName}&ll=69.279729,41.311153&spn=10,10`
          ).then((res) => res.json())
          if (response.response) {
            setYmapSearchResults(
              response.response.GeoObjectCollection.featureMember
            )
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
    getAddressResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressName])

  const onChange = (e) => {
    if (deliveryType == 'delivery') {
      setAddressName(e.target.value)
    } else if (deliveryType == 'self-pickup') {
      setBranchSearch(e.target.value)
      setYmapSearchResults(
        branches?.filter((branch) =>
          branch.name.toLowerCase().includes(e.target.value.toLowerCase())
        )
      )
    }
    setShowSearchResults(true)
    setPlacemarkCoords(null)
  }

  const onKeyDown = (e) => {
    if (ymapSearchResults?.length > 0) {
      if (e.which === 13)
        if (deliveryType == 'delivery') {
          onResultSelect(
            ymapSearchResults[activeResultIdx].GeoObject,
            'geocode'
          )
          setAddressName(ymapSearchResults[activeResultIdx].GeoObject?.name)
        } else {
          onResultSelect(ymapSearchResults[activeResultIdx], 'branch')
          setAddressName(ymapSearchResults[activeResultIdx].name)
        }
      if (e.which === 40) {
        activeResultIdx < ymapSearchResults?.length &&
          setActiveResultIdx((prev) => ++prev)
      }
      if (e.which === 38) {
        activeResultIdx > 0 && setActiveResultIdx((prev) => --prev)
      }
    }
  }

  const onResultSelect = (selected, searchType) => {
    if (searchType == 'geocode') {
      const locale = []
      selected.Point.pos
        .split(' ')
        .reverse()
        .forEach((pos) => {
          locale.push(parseFloat(pos))
        })
      setAddressName(selected?.name)
      setPoisition(locale)
    } else if (searchType == 'branch') {
      setAddressName(selected?.address)
      setPoisition([selected.location.lat, selected.location.long])
      setActiveBranch(selected)
    }
    setYmapSearchResults([])
    setShowSearchResults(false)
  }

  const onClear = () => {
    setAddressName('')
    setAddressName('')
    setYmapSearchResults([])
    setShowSearchResults(false)
    setPlacemarkCoords(null)
  }

  return (
    <div className={styles.address_search}>
      <div className={styles.address_search_wrapper}>
        <input
          type="text"
          value={deliveryType == 'delivery' ? addressName : branchSearch}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={styles.address_search_input}
          autoComplete="off"
          autoFocus={true}
        />
        {addressName && (
          <div className={styles.address_search_clear} onClick={onClear}>
            <CloseIcon fontSize="small" />
          </div>
        )}
      </div>
      {showSearchResults && ymapSearchResults?.length > 0 && (
        <div className={styles.results}>
          <div className={styles.results_list}>
            {ymapSearchResults?.map((item, idx) =>
              deliveryType == 'delivery' ? (
                <div
                  key={item?.GeoObject.name + item?.GeoObject.Point.pos}
                  className={idx == activeResultIdx ? styles.active : ''}
                  onClick={() => onResultSelect(item.GeoObject, 'geocode')}
                >
                  {item.GeoObject.name}{' '}
                  <span>{item.GeoObject.description}</span>
                </div>
              ) : (
                <div
                  key={item?.id}
                  onClick={() => onResultSelect(item, 'branch')}
                  className={idx == activeResultIdx ? styles.active : ''}
                >
                  {item.name} <span>{item.address}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MapDialog({ open, title, handleClose, point, setPoint }) {
  const { points, isMapModal, deliveryType, branch } = useSelector(
    (state) => state.common
  )

  const [ymaps, setYmaps] = useState('')
  const [ymapsPoint, setYmapsPoint] = useState([41.311153, 69.279729])
  const [placemarkCoords, setPlacemarkCoords] = useState()
  const [addressName, setAddressName] = useState('')
  const [typeDelivery, setTypeDelivery] = useState(deliveryType ?? 'delivery')
  const [activeBranch, setActiveBranch] = useState(null)
  const [branches, setBranches] = useState(null)

  // We need current time to know if the branches are open or close now
  const currentTime = dayjs().format('HH:mm')
  const { t } = useTranslation('common')
  const dispatch = useDispatch()
  const mapRef = useRef()
  const branchWrapperRef = useRef(null)
  const zoom = useRef(11)
  const apikey = 'your-api-key'
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Get branches
  const { data: branchesData } = useSWR(
    !branches ? '/get-your-branches' : null,
    fetcher
  )

  // Set branches to state
  useEffect(() => {
    if (branchesData) {
      setBranches(branchesData?.branches)
    }
  }, [branchesData])

  // Set default branch from storage to state
  useEffect(() => {
    if (isMapModal && branch && deliveryType == 'self-pickup') {
      setActiveBranch(branch)
      setYmapsPoint([branch.location.lat, branch.location.long])
      zoom.current = 18
    }
  }, [isMapModal, branch, deliveryType, mapRef])

  // Get details of point when editing it
  useEffect(() => {
    if (point && open) {
      setAddressName(point?.address)
      setYmapsPoint(point?.location)
      setPlacemarkCoords(point?.location)
    }
  }, [open, point])

  // Active Branch scroll animation
  useEffect(() => {
    branchWrapperRef &&
      branchWrapperRef.current?.childNodes.forEach((child) => {
        if (child.id == activeBranch?.id) {
          branchWrapperRef.current.scrollTop =
            child.offsetTop - child.parentElement.offsetTop - 8
        }
      })
  }, [activeBranch])

  const onMapClick = (e) => {
    if (typeDelivery === 'delivery') {
      const coords = e.get('coords')
      setPlacemarkCoords(coords)
      getAddress(coords)
    }
  }

  const confirmHandler = () => {
    if (typeDelivery === 'delivery') {
      const coords = placemarkCoords
      dispatch(mapModalHandler(false))
      dispatch(addUserLocation(coords))
      if (point) {
        const isPointSaved = points.find((item) => item.id === point.id)
        if (isPointSaved) {
          dispatch(
            updatePoint({
              ...point,
              location: coords,
              address: addressName,
              isActive: true,
            })
          )
        }
      } else {
        const isAddressSaved = points.find(
          (item) => item.address === addressName
        )
        if (isAddressSaved) {
          dispatch(activateAddress(isAddressSaved.id))
        } else {
          dispatch(
            savePoint({
              id: uuidv4(),
              location: coords,
              address: addressName,
              isActive: true,
            })
          )
        }
      }
      setPoint &&
        setPoint((prevState) => ({
          ...prevState,
          address: addressName,
        }))
      setYmapsPoint(coords)
    } else {
      dispatch(
        branchIdHandler({
          id: activeBranch.id,
          address: activeBranch.address,
          name: activeBranch.name,
          location: activeBranch.location,
        })
      )
      setYmapsPoint([activeBranch.location.lat, activeBranch.location.long])
    }
    dispatch(deliveryTypeHandler(typeDelivery))
    isMapModal && dispatch(mapModalHandler(false))
    handleClose()
  }

  // Determining the address by coordinates (reverse geocoding).
  const getAddress = (coords) => {
    ymaps.geocode(coords).then(function (res) {
      var firstGeoObject = res.geoObjects.get(0)
      setAddressName(
        [
          // Getting the path to the toponym; if the method returns null, then requesting the name of the building.
          firstGeoObject.getThoroughfare() || firstGeoObject.getPremise(),
          // The name of the municipality or the higher territorial-administrative formation.
          firstGeoObject.getLocalities().length
            ? firstGeoObject.getLocalities().reverse().join(', ')
            : firstGeoObject.getAdministrativeAreas(),
        ]
          .filter(Boolean)
          .join(', ')
          .replace('Ташкент,', '')
      )
    })
  }

  const onBranchClick = (branch) => {
    if (
      (branch.work_hour_start < currentTime &&
        currentTime < branch.work_hour_end) ||
      (branch.work_hour_start < currentTime &&
        branch.work_hour_end < currentTime &&
        branch.work_hour_end < branch.work_hour_start) ||
      (branch.work_hour_end > currentTime &&
        branch.work_hour_start > currentTime &&
        branch.work_hour_end < branch.work_hour_start)
    ) {
      setActiveBranch(branch)
      setAddressName(branch.address)
    } else {
      console.log('branch ish vaqtimas')
      setActiveBranch(null)
    }
    mapRef &&
      mapRef.current?.setCenter(
        [branch.location.lat, branch.location.long],
        18,
        {
          duration: 300,
        }
      )
  }

  const setPoisition = (position, address) => {
    mapRef.current?.setCenter(position, 18, {
      duration: 300,
    })
    setPlacemarkCoords(position)
    address && getAddress(position)
  }

  const onLocationChange = (event) => {
    var position = event.get('position')
    setPoisition(position, 'address')
  }

  return (
    <Dialog
      open={open || isMapModal}
      onClose={() => {
        handleClose()
        dispatch(mapModalHandler(false))
        placemarkCoords && setYmapsPoint(placemarkCoords)
      }}
      className={styles.dialog}
      maxWidth="md"
      fullWidth={true}
      fullScreen={isMobile}
      TransitionComponent={Transition}
    >
      {isMobile ? (
        <>
          <YMaps
            query={{
              load: 'Map,Placemark',
              apikey: apikey,
            }}
          >
            <Map
              className={styles.mobile_map}
              state={{
                center: ymapsPoint,
                zoom: zoom.current,
              }}
              instanceRef={mapRef}
              onLoad={(ymaps) => setYmaps(ymaps)}
              modules={['Placemark', 'geocode']}
              onClick={onMapClick}
            >
              {typeDelivery === 'delivery' && (
                <>
                  <GeolocationControl
                    options={{ noPlacemark: true }}
                    onLocationChange={onLocationChange}
                  />
                  {placemarkCoords && (
                    <Placemark
                      geometry={placemarkCoords}
                      options={{
                        preset: 'islands#redStretchyIcon',
                      }}
                      properties={{
                        iconContent: 'Я',
                      }}
                    />
                  )}
                </>
              )}
              {typeDelivery === 'self-pickup' && (
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
                      properties={{
                        iconCaption: branch.name,
                      }}
                      onClick={() => onBranchClick(branch)}
                    />
                  ))}
                </Clusterer>
              )}
            </Map>
          </YMaps>
          <div className={styles.mobile_content}>
            <div>
              <DialogTitle className={styles.title}>{title}</DialogTitle>
              <p className={styles.subtitle}>{t('to_see_your_current_menu')}</p>
              <div>
                <div className={styles.flexbox_align_center}>
                  <div
                    className={classNames(styles.button_toggle, {
                      [styles.active]: typeDelivery === 'delivery',
                    })}
                    onClick={() => setTypeDelivery('delivery')}
                  >
                    {t('delivery')}
                  </div>
                  <div
                    className={classNames(styles.button_toggle, {
                      [styles.active]: typeDelivery === 'self-pickup',
                    })}
                    onClick={() => setTypeDelivery('self-pickup')}
                  >
                    {t('takeaway')}
                  </div>
                </div>
                <CustomSearchControl
                  placeholder={
                    typeDelivery === 'delivery'
                      ? t('delivery_address')
                      : t('search_by_restaurant_name')
                  }
                  addressName={addressName}
                  apikey={apikey}
                  deliveryType={typeDelivery}
                  branches={branches}
                  setAddressName={setAddressName}
                  setPoisition={setPoisition}
                  setActiveBranch={setActiveBranch}
                  setPlacemarkCoords={setPlacemarkCoords}
                />
                {typeDelivery === 'self-pickup' && (
                  <RadioGroup
                    aria-labelledby="branch-location"
                    value={activeBranch && JSON.stringify(activeBranch)}
                    name="branches-in-map"
                    onChange={(e) => onBranchClick(JSON.parse(e.target.value))}
                    className={styles.branches}
                    ref={branchWrapperRef}
                  >
                    {branches?.map((branch) => (
                      <CustomRadio
                        key={branch.id + branch.location.long}
                        value={JSON.stringify(branch)}
                        branch={branch}
                        advanced
                      />
                    ))}
                  </RadioGroup>
                )}
              </div>
            </div>
            <div className={styles.select_button}>
              <Button
                color={
                  (typeDelivery === 'delivery' &&
                    placemarkCoords?.length > 0 &&
                    addressName.length > 0) ||
                    (typeDelivery == 'self-pickup' && activeBranch)
                    ? 'primary'
                    : 'disabled'
                }
                onClick={() =>
                  (typeDelivery === 'delivery' &&
                    placemarkCoords?.length > 0) ||
                    (typeDelivery == 'self-pickup' && activeBranch)
                    ? confirmHandler()
                    : undefined
                }
              >
                {t('select')}
              </Button>
            </div>
            <IconButton
              onClick={() => {
                handleClose()
                dispatch(mapModalHandler(false))
              }}
              className={styles.closeIcon}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </>
      ) : (
        <>
          <DialogTitle className={styles.title}>{title}</DialogTitle>
          <p className={styles.subtitle}>{t('to_see_your_current_menu')}</p>
          <DialogContent className={styles.content}>
            <div className={styles.actions}>
              <div>
                <div className={styles.flexbox_align_center}>
                  <div
                    className={classNames(styles.button_toggle, {
                      [styles.active]: typeDelivery === 'delivery',
                    })}
                    onClick={() => setTypeDelivery('delivery')}
                  >
                    {t('delivery')}
                  </div>
                  <div
                    className={classNames(styles.button_toggle, {
                      [styles.active]: typeDelivery === 'self-pickup',
                    })}
                    onClick={() => setTypeDelivery('self-pickup')}
                  >
                    {t('takeaway')}
                  </div>
                </div>
                <CustomSearchControl
                  placeholder={
                    typeDelivery === 'delivery'
                      ? t('delivery_address')
                      : t('search_by_restaurant_name')
                  }
                  addressName={addressName}
                  apikey={apikey}
                  deliveryType={typeDelivery}
                  branches={branches}
                  setAddressName={setAddressName}
                  setPoisition={setPoisition}
                  setActiveBranch={setActiveBranch}
                  setPlacemarkCoords={setPlacemarkCoords}
                />
                {typeDelivery === 'self-pickup' && (
                  <RadioGroup
                    aria-labelledby="branch-location"
                    value={activeBranch && JSON.stringify(activeBranch)}
                    name="branches-in-map"
                    onChange={(e) => onBranchClick(JSON.parse(e.target.value))}
                    ref={branchWrapperRef}
                    className={styles.branches}
                  >
                    {branches?.map((branch) => (
                      <CustomRadio
                        key={branch.id + branch.location.long}
                        value={JSON.stringify(branch)}
                        branch={branch}
                        advanced
                      />
                    ))}
                  </RadioGroup>
                )}
              </div>
              <Button
                color={
                  (typeDelivery === 'delivery' &&
                    placemarkCoords?.length > 0 &&
                    addressName.length > 0) ||
                    (typeDelivery == 'self-pickup' && activeBranch)
                    ? 'primary'
                    : 'disabled'
                }
                onClick={() =>
                  (typeDelivery === 'delivery' &&
                    placemarkCoords?.length > 0) ||
                    (typeDelivery == 'self-pickup' && activeBranch)
                    ? confirmHandler()
                    : undefined
                }
              >
                {t('select')}
              </Button>
            </div>
            <YMaps
              query={{
                load: 'Map,Placemark',
                apikey: apikey,
              }}
            >
              <Map
                className={styles.map}
                state={{
                  center: ymapsPoint,
                  zoom: zoom.current,
                }}
                instanceRef={mapRef}
                onLoad={(ymaps) => setYmaps(ymaps)}
                modules={['Placemark', 'geocode']}
                onClick={onMapClick}
              >
                {typeDelivery === 'delivery' && (
                  <>
                    <GeolocationControl
                      options={{ noPlacemark: true }}
                      onLocationChange={onLocationChange}
                    />
                    {placemarkCoords && (
                      <Placemark
                        geometry={placemarkCoords}
                        options={{
                          preset: 'islands#redStretchyIcon',
                        }}
                        properties={{
                          iconContent: 'Я',
                        }}
                      />
                    )}
                  </>
                )}
                {typeDelivery === 'self-pickup' && (
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
                        properties={{
                          iconCaption: branch.name,
                        }}
                        onClick={() => onBranchClick(branch)}
                      />
                    ))}
                  </Clusterer>
                )}
              </Map>
            </YMaps>
          </DialogContent>
          <IconButton
            onClick={() => {
              handleClose()
              dispatch(mapModalHandler(false))
            }}
            className={styles.closeIcon}
          >
            <CloseIcon />
          </IconButton>
        </>
      )}
    </Dialog>
  )
}

export default memo(MapDialog)
