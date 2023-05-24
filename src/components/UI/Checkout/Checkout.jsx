import { useState, useEffect, useRef } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { fetcher } from 'utils/fetcher'
import useSWR from 'swr'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import calendar from 'dayjs/plugin/calendar'
import('dayjs/locale/uz-latn')
import('dayjs/locale/ru')
import('dayjs/locale/en')

import { setOrderIds, mapModalHandler } from 'store/common/commonSlice'
import { updateName } from 'store/auth/authSlice'
import { clear } from 'store/cart/cartSlice'
import { getNearestBranch, getComputedPrice, createOrder } from 'services'

import {
  Container,
  RadioGroup,
  FormControlLabel,
  Radio,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { FmdGood, WatchLater } from '@mui/icons-material'

import CardX from '../CardX/CardX'
import Button from '../Button/Button'
import FormDialog from '../FormDialog/FormDialog'
import Carousel from '../Carousel/Carousel'
import Input from '../Input/Input'
import Textarea from '../Textarea/Textarea'
import Bill from '../Bill/Bill'
import MiniCard from '../MiniCard/MiniCard'
import CustomRadio from '../CustomRadio/CustomRadio'
import TimePicker from '../TimePicker/TimePicker'

import styles from './style.module.scss'
import { toast } from 'react-toastify'

export function Checkout() {
  const { user } = useSelector((state) => state.auth)
  const { cart } = useSelector((state) => state.cart)
  const { points, deliveryType, branch } = useSelector((state) => state.common)

  const [branchWorkHours, setBranchWorkHours] = useState(null)
  const [isTimePicker, setIsTimePicker] = useState(false)
  const [userName, setUserName] = useState(user?.name)
  const [isDialog, setIsDialog] = useState(null)
  const [totalPrice, setTotalPrice] = useState(0)
  const [reProducts, setReProducts] = useState(null)
  const [stepsData, setStepsData] = useState({
    address: '',
    branch_id: '',
    branch_name: '',
    description: '',
    destination_address: '',
    location: {
      lat: null,
      long: null,
    },
    phone_number: '',
    products: [],
  })
  const [orderData, setOrderData] = useState({
    aggregator_id: null,
    accommodation: '',
    apartment: '',
    building: '',
    client_id: user?.id,
    co_delivery_price: 0,
    delivery_type: 'delivery',
    extra_phone_number: '',
    description: '',
    floor: '',
    id: '',
    fare_id: '',
    future_time: null,
    is_cancel_old_order: false,
    is_courier_call: true,
    is_preorder: false,
    is_reissued: false,
    paid: false,
    payment: [
      {
        created_at: '',
        id: '',
        order_id: '',
        paid_amount: 0,
        payment_type: '',
        returned_amount: 0,
      },
    ],
    payment_type: 'cash',
    source: 'website',
    steps: [],
    to_address: '',
    to_location: { lat: 41.26935630336735, long: 69.23841858451905 },
  })

  const {
    accommodation,
    building,
    floor,
    apartment,
    is_courier_call,
    payment_type,
    description,
    future_time,
    co_delivery_price,
    to_address,
  } = orderData
  const { address } = stepsData

  const productsId = useRef(null)
  const { t } = useTranslation('order')
  const router = useRouter()
  const { repeat, orderid } = router.query
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  dayjs.extend(calendar)

  const { data: branchData } = useSWR(
    deliveryType == 'self-pickup' && branch
      ? '/v1/branches/' + branch.id
      : null,
    fetcher
  )

  const { data: reorderData } = useSWR(
    repeat == 'true' && orderid ? '/v2/order/' + orderid : null,
    fetcher
  )

  const { data: favourites } = useSWR(
    productsId
      ? '/v2/product-favourites?product_ids=' + productsId.current
      : null,
    fetcher
  )

  // Get products and modifiers total price
  useEffect(() => {
    if (!repeat && cart.length > 0) {
      let total = 0
      cart?.map((product) => {
        total += product.price * product.quantity
      })
      setTotalPrice(total)
    } else if (repeat && reProducts?.length > 0) {
      let total = 0
      reProducts?.map((product) => {
        total += product.price * product.quantity
      })
      setTotalPrice(total)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, reProducts, repeat])

  // Set delivery details & Get delivery price
  useEffect(() => {
    if (deliveryType == 'delivery') {
      if (points.length > 0)
        for (const point of points) {
          if (point.isActive) {
            setOrderData((prevState) => ({
              ...prevState,
              to_address: point.address,
              to_location: { lat: point.location[0], long: point.location[1] },
            }))
            deliveryPriceHandler(point.location[0], point.location[1])
            break
          }
        }
    } else if (deliveryType == 'self-pickup') {
      setOrderData((prevState) => ({
        ...prevState,
        co_delivery_price: 0,
        to_address: '',
        to_location: { lat: 41.26935630336735, long: 69.23841858451905 },
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, deliveryType, branch])

  // Set branch details to state
  useEffect(() => {
    if (branchData) {
      setStepsData((prevState) => ({
        ...prevState,
        address: branchData.address,
        branch_id: branchData.id,
        branch_name: branchData.name,
        destination_address: branchData.destination,
        phone_number: branchData.phone,
        location: {
          lat: branchData.location.lat,
          long: branchData.location.long,
        },
      }))
      setBranchWorkHours({
        work_hour_start: branchData.work_hour_start,
        work_hour_end: branchData.work_hour_end,
      })
    }
  }, [branchData])

  // Add Products to steps
  useEffect(() => {
    if (!repeat && cart.length > 0) {
      const productArr = []
      for (const item of cart) {
        const mockProduct = {
          price: item.price,
          product_id: item.product_id,
          type: item.type,
          variants: item.variants,
          quantity: item.quantity,
          client_id: item.client_id ? item.client_id : user?.id,
        }
        productArr.push(mockProduct)
      }
      setStepsData((prevState) => ({ ...prevState, products: productArr }))
    } else if (repeat == 'true' && orderid && reorderData) {
      setOrderData({
        aggregator_id: null,
        accommodation: reorderData?.accommodation ?? '',
        apartment: reorderData?.apartment ?? '',
        building: reorderData?.building ?? '',
        client_id: user?.id,
        co_delivery_price: 0,
        delivery_type: reorderData?.delivery_type,
        description: reorderData?.description ?? '',
        floor: reorderData?.floor ?? '',
        is_courier_call: reorderData?.is_courier_call,
        extra_phone_number: '',
        future_time: null,
        id: '',
        fare_id: '',
        is_cancel_old_order: false,
        is_preorder: false,
        is_reissued: false,
        paid: false,
        payment: [
          {
            created_at: '',
            id: '',
            order_id: '',
            paid_amount: 0,
            payment_type: '',
            returned_amount: 0,
          },
        ],
        payment_type: reorderData?.payment_type ?? '',
        source: 'website',
        steps: [],
        to_address: reorderData?.to_address ?? '',
        to_location: reorderData?.to_location ?? {},
      })
      setStepsData({
        address: reorderData?.steps[0].address ?? '',
        branch_id: reorderData?.steps[0].branch_id ?? '',
        branch_name: reorderData?.steps[0].branch_name ?? '',
        description: reorderData?.steps[0].description ?? '',
        destination_address: reorderData?.steps[0].destination_address ?? '',
        location: reorderData?.steps[0].location ?? '',
        phone_number: reorderData?.steps[0].phone_number ?? '',
      })
      // Products in steps
      if (!reProducts) {
        const reorderingProducts = []
        for (const item of reorderData?.steps[0].products) {
          const mockProduct = {
            key: uuidv4(),
            price: item.price,
            product_id: item.product_id,
            type: item.type,
            variants: item.variants,
            quantity: item.quantity,
            client_id: item.client_id ? item.client_id : user?.id,
          }
          reorderingProducts.push(mockProduct)
        }
        setReProducts(reorderingProducts)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, user, repeat, orderid, reorderData])

  // useEffect(() => {
  //   if (!user) {
  //     router.push('/')
  //   }
  // }, [user, router])

  // Get Product Favourites
  useEffect(() => {
    const productIdsArr = []
    if (!repeat && cart.length > 0) {
      for (const product of cart) {
        productIdsArr.push(product.product_id)
      }
      productsId.current = productIdsArr.join(',')
    } else if (repeat == 'true' && reProducts) {
      for (const product of reProducts) {
        productIdsArr.push(product.product_id)
      }
      productsId.current = productIdsArr.join(',')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, repeat, reProducts])

  const onChange = (e) => {
    let boolean = null

    if (e.target.value === 'true') {
      boolean = true
    }
    if (e.target.value === 'false') {
      boolean = false
    }

    setOrderData((prevState) => ({
      ...prevState,
      [e.target.id]: boolean ?? e.target.value,
    }))
  }

  // Get Delivery Price
  const deliveryPriceHandler = async (lat, long) => {
    if (user) {
      getNearestBranch(lat, long, user.access_token)
        .then((res) => {
          for (let nearestBranch of res.branches) {
            if (nearestBranch.is_active) {
              setStepsData((prevState) => ({
                ...prevState,
                address: nearestBranch.address,
                branch_id: nearestBranch.id,
                branch_name: nearestBranch.name,
                destination_address: nearestBranch.destination,
                phone_number: nearestBranch.phone,
                location: {
                  lat: nearestBranch.location.lat,
                  long: nearestBranch.location.long,
                },
              }))
              setBranchWorkHours({
                work_hour_start: nearestBranch.work_hour_start,
                work_hour_end: nearestBranch.work_hour_end,
              })
              getComputedPrice(
                {
                  branch_id: nearestBranch.id,
                  lat: lat,
                  long: long,
                  order_price: totalPrice,
                },
                user.access_token
              )
                .then((res) =>
                  setOrderData((prevState) => ({
                    ...prevState,
                    co_delivery_price: res.price ? res.price : 0,
                  }))
                )
                .catch((err) => console.log(err))
              break
            }
          }
        })
        .catch((err) => console.log(err))
    }
  }

  const paymentTypeHandler = (e) => {
    setOrderData((prevState) => ({
      ...prevState,
      payment_type: e.target.value,
    }))
  }

  const curierCallHandler = ({ target: { value } }) => {
    setOrderData((prevState) => ({
      ...prevState,
      is_courier_call: value == 'true' ? true : false,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if (
      totalPrice > 1000 // minimal_order_price
    ) {
      // Filtering Reordering products data
      const steps = repeat && {
        ...stepsData,
        products: reProducts.map((product) => ({
          price: product.price,
          product_id: product.product_id,
          type: product.type,
          variants: product.variants,
          quantity: product.quantity,
          client_id: product.client_id,
        })),
      }
      // Request Action
      createOrder({
        ...orderData,
        delivery_type: deliveryType,
        future_time: future_time ? future_time : null,
        steps: repeat ? [steps] : [stepsData],
      })
        .then((res) => {
          dispatch(
            setOrderIds({
              external_order_id: res.external_order_id,
              order_id: res.order_id,
            })
          )
          dispatch(clear())
          router.push('/')
        })
        .catch((error) => {
          toast.error(
            (error.response &&
              error.response.data &&
              error.response.data.Error) ||
              error.message
          )
          console.log(error)
        })
    }
  }

  const isCourierCallValidate = () => {
    if (deliveryType == 'delivery') {
      if (!is_courier_call && accommodation && floor && apartment && building)
        return true
      else if (is_courier_call) return true
      else
        return !accommodation || !floor || !apartment || !building
          ? false
          : true
    } else return true
  }

  const onFutureTimeChange = (val) => {
    setOrderData((prevState) => ({
      ...prevState,
      future_time: val,
      is_preorder: val ? true : false,
    }))
    setIsTimePicker(false)
  }

  return (
    <>
      <div className={styles.checkout}>
        <Container>
          <h2>{t('checkout')}</h2>
          <form
            className={styles.flexbox_wrap_between}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className={styles.details}>
              <section id="personal_data" className={styles.box}>
                <h3>{t('personal_data')}</h3>
                <div
                  className={isMobile ? styles.grid_col_1 : styles.grid_col_2}
                >
                  <Input
                    label={t('name')}
                    placeholder={t('name')}
                    id="name"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onEdit={() => {
                      console.log({
                        name: userName,
                        phone: user?.phone,
                        id: user?.id,
                        access_token: user?.access_token,
                      })
                      dispatch(updateName(userName))
                    }}
                    edit={true}
                  />
                  <Input
                    label={t('phone_number')}
                    placeholder={t('phone_number')}
                    type="tel"
                    value={user?.phone.replace('+998', '')}
                    disabled={true}
                  />
                </div>
              </section>
              <section id="delivery_details" className={styles.box}>
                <div className={styles.flexbox_center_between}>
                  <h3>
                    {t(
                      deliveryType === 'delivery'
                        ? 'delivery_address'
                        : 'takeaway_order'
                    )}
                  </h3>
                  <div
                    onClick={() => dispatch(mapModalHandler(true))}
                    className={styles.button_gray}
                  >
                    <p>{t('change')}</p>
                  </div>
                </div>
                <div className={styles.flexbox_align_center}>
                  <FmdGood />
                  {deliveryType === 'delivery' ? to_address : address}
                </div>
                {deliveryType === 'delivery' && (
                  <>
                    <div
                      className={
                        isMobile ? styles.grid_col_2 : styles.grid_col_4
                      }
                    >
                      <Input
                        id="accommodation"
                        type="text"
                        value={accommodation}
                        placeholder={t('accommodation')}
                        onChange={onChange}
                        required={!is_courier_call}
                      />
                      <Input
                        id="floor"
                        type="text"
                        value={floor}
                        placeholder={t('floor')}
                        onChange={onChange}
                        required={!is_courier_call}
                      />
                      <Input
                        id="apartment"
                        type="text"
                        value={apartment}
                        placeholder={t('apartment')}
                        onChange={onChange}
                        required={!is_courier_call}
                      />
                      <Input
                        id="building"
                        type="text"
                        value={building}
                        placeholder={t('building')}
                        onChange={onChange}
                        required={!is_courier_call}
                      />
                    </div>
                    <Textarea
                      id="description"
                      placeholder={t('description_to_the_order')}
                      value={description}
                      onChange={onChange}
                      className={styles.textarea}
                    />
                  </>
                )}
              </section>
              <section id="delivery_details" className={styles.box}>
                <div className={styles.flexbox_center_between}>
                  <h3>
                    {t(
                      deliveryType === 'delivery'
                        ? 'delivery_time'
                        : 'pickup_time'
                    )}
                  </h3>
                  <div
                    onClick={() => setIsTimePicker(true)}
                    className={styles.button_gray}
                  >
                    <p>{t('change')}</p>
                  </div>
                </div>
                <div className={styles.flexbox_align_center}>
                  <WatchLater />
                  {future_time
                    ? `${
                        dayjs(future_time).get('day') == dayjs().get('day')
                          ? t('today')
                          : dayjs(future_time)
                              .locale(
                                router.locale == 'uz'
                                  ? 'uz-latn'
                                  : router.locale
                              )
                              .format(
                                router.locale == 'en' ? 'MMMM DD' : 'DD MMMM'
                              )
                      } - ${dayjs(future_time).format(
                        router.locale == 'en' ? 'hh:mm A' : 'HH:mm'
                      )}`
                    : `${t('today')} ~ ${dayjs()
                        .add(30, 'm') // max_delivery_time
                        .format(
                          router.locale == 'en' ? 'hh:mm A' : 'HH:mm'
                        )} (30 ${t('minutes')})`}
                </div>
              </section>
              <section className={`${styles.box} ${styles.products}`}>
                <div className={styles.header}>
                  <h3>{t('product_list')}</h3>
                </div>
                {repeat
                  ? reProducts?.map((item) => (
                      <CardX
                        key={item.key}
                        product={item}
                        setReProducts={setReProducts}
                        repeat={true}
                      />
                    ))
                  : cart?.map((item) => (
                      <CardX key={item.key} product={item} />
                    ))}
              </section>
              {deliveryType == 'delivery' && (
                <section className={styles.box}>
                  <h3>{t('can_the_courier_call')}</h3>
                  <RadioGroup
                    aria-labelledby="can-curier-call"
                    value={is_courier_call}
                    onChange={curierCallHandler}
                    id="is_courier_call"
                    name="is_courier_call"
                    row
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio color="primary" />}
                      label={t('yes')}
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio color="primary" />}
                      label={t('no')}
                    />
                  </RadioGroup>
                </section>
              )}
              <section id="payment_type" className={styles.box}>
                <h3> {t('payment_method')}</h3>
                <RadioGroup
                  aria-labelledby="payment-method"
                  value={payment_type}
                  onChange={paymentTypeHandler}
                  className={isMobile ? styles.grid_col_1 : styles.flexbox}
                  row
                >
                  <CustomRadio
                    value="cash"
                    src="/images/cash.svg"
                    label={t('cash')}
                  />
                  <CustomRadio
                    value="payme"
                    src="/images/payme.svg"
                    label="Payme"
                  />
                  <CustomRadio
                    value="click"
                    src="/images/click.svg"
                    label="Click"
                  />
                </RadioGroup>
              </section>
            </div>
            {isMobile && favourites?.favourites?.length > 0 && (
              <>
                <div className={styles.favourites}>
                  <h3>{t('something_else?')}</h3>
                  <Carousel multiple>
                    {favourites?.favourites?.map((product) => (
                      <MiniCard key={product.id} product={product} />
                    ))}
                  </Carousel>
                </div>
              </>
            )}
            <Bill
              onSubmit={onSubmit}
              validate={isCourierCallValidate()}
              totalPrice={totalPrice}
              deliveryPrice={co_delivery_price}
              minPrice={1000} // minimal_order_price
            />
          </form>
          {!isMobile && favourites?.favourites?.length > 0 && (
            <>
              <div className={styles.favourites}>
                <h3>{t('something_else?')}</h3>
                <Carousel multiple>
                  {favourites?.favourites?.map((product) => (
                    <MiniCard key={product.id} product={product} />
                  ))}
                </Carousel>
              </div>
            </>
          )}
        </Container>
      </div>
      <FormDialog
        open={isDialog !== null}
        title={t('attention')}
        descr={t('are_you_sure-product')}
        handleClose={() => setIsDialog(null)}
      >
        <div className={styles.flexbox}>
          <Button color="disabled" onClick={() => setIsDialog(null)}>
            {t('no')}
          </Button>
          <Button onClick={() => setIsDialog(!isDialog)}>{t('yes')}</Button>
        </div>
      </FormDialog>
      <TimePicker
        open={isTimePicker}
        handleClose={() => setIsTimePicker(false)}
        onChange={onFutureTimeChange}
        value={future_time ? future_time : null}
        title={t(deliveryType === 'delivery' ? 'delivery_time' : 'pickup_time')}
        interval={30} // max_delivery_time
        startTime={+branchWorkHours?.work_hour_start.split(':')[0]}
        endTime={
          +branchWorkHours?.work_hour_end.split(':')[0] <
          +branchWorkHours?.work_hour_start.split(':')[0]
            ? 23
            : +branchWorkHours?.work_hour_end.split(':')[0]
        }
      />
    </>
  )
}
