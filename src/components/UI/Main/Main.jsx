import { useEffect, useState, useRef, memo } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { useDispatch, useSelector } from 'react-redux'
import { clearOrderIds } from 'store/common/commonSlice'

import { Grid, Container } from '@mui/material'
import Card from '../Card/Card'
import Navbar from '../Navbar/Navbar'
import Button from '../Button/Button'
import PopupAlert from '../Popup/Popup'
import Carousel from '../Carousel/Carousel'
import ComboCard from '../ComboCard/ComboCard'
import FormDialog from '../FormDialog/FormDialog'
import GroupButton from '../GroupButton/GroupButton'
import OriginCard from '../OriginCard/OriginCard'

import classNames from 'classnames'
import styles from './style.module.scss'

function Main({ banners, categories, popups }) {
  const [activeCategory, setActiveCategory] = useState(null)
  const [activePopup, setActivePopup] = useState(null)
  const [closedPopups, setClosedPopups] = useState([])
  const [notifications, setNotifications] = useState([])
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isFixedCatalog, setIsFixedCatalog] = useState(false)
  const [scrollDir, setScrollDir] = useState('scrolling down')

  const catalogRef = useRef(null)
  const catalogMenuRef = useRef(null)
  const { orderIds } = useSelector((state) => state.common)
  const { t } = useTranslation('common')
  const router = useRouter()
  const dispatch = useDispatch()
  const successDialog = orderIds ? true : false

  // Get closed popups from Session storage
  useEffect(() => {
    const closed = JSON.parse(window.sessionStorage.getItem('closed'))
    closed && setClosedPopups(closed)

    catalogMenuRef.current.scrollLeft = 0 // Just, actually out of box
    // Fixing chrome's bug, there is another scroll actions, so the scroll behavior not working (https://stackoverflow.com/questions/73052119/scroll-behavior-smooth-doesnt-work-on-html-in-chrome)
    var isFirefox = typeof InstallTrigger !== 'undefined'
    if (isFirefox) {
      document.querySelector('html').style.scrollBehavior = 'smooth'
    }
  }, [])

  // Active category animation
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    if (scrollPosition > catalogRef.current.offsetTop - 10)
      setIsFixedCatalog(true)
    else {
      setIsFixedCatalog(false)
      catalogMenuRef.current.scrollLeft = 0
    }
    catalogRef.current.childNodes.forEach((child) => {
      scrollPosition > child.offsetTop - 60 &&
        scrollPosition < child.offsetTop + child.offsetHeight - 60 &&
        setActiveCategory(child.id)
    })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrollPosition])

  // Detecting scroll direction
  useEffect(() => {
    const threshold = 0
    let lastScrollY = window.pageYOffset
    let ticking = false

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false
        return
      }
      setScrollDir(scrollY > lastScrollY ? 'scrolling down' : 'scrolling up')
      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [scrollDir])

  // Change catalog menu scroll-x position
  useEffect(() => {
    catalogMenuRef.current.childNodes.length &&
      catalogMenuRef.current.childNodes?.forEach(
        (child) =>
          child.childNodes[0].attributes[0].value == '#' + activeCategory &&
          (scrollDir === 'scrolling down'
            ? (catalogMenuRef.current.scrollLeft =
                child.offsetLeft - catalogMenuRef.current.offsetLeft)
            : (catalogMenuRef.current.scrollLeft =
                child.offsetLeft - catalogMenuRef.current.offsetLeft))
      )
  }, [activeCategory, scrollDir])

  useEffect(() => {
    popups &&
      setNotifications(
        popups?.filter(
          (notification) =>
            !closedPopups.some((item) => item.id === notification.id)
        )
      )
  }, [closedPopups, popups])

  useEffect(() => {
    notifications.length > 0 && setActivePopup(notifications[0])
  }, [notifications])

  const handleScroll = () => {
    const position = window.pageYOffset
    setScrollPosition(position)
  }

  const onClosePopup = () => {
    window.sessionStorage.setItem(
      'closed',
      JSON.stringify([...closedPopups, activePopup])
    )
    setClosedPopups([...closedPopups, activePopup])
  }

  return (
    <>
      <main className={styles.main}>
        <Container>
          {banners && <Carousel multiple={false} list={banners} />}
          <div className={styles.catalog}>
            <div className={styles.wrapper}>
              {categories?.map((item) => (
                <div key={item?.title.en + item?.title.uz}>
                  <a href={`#${item?.title.en}`}>
                    <GroupButton
                      size="sm"
                      active={activeCategory?.includes(item?.title.en)}
                      onClick={() => setActiveCategory(item?.title.en)}
                    >
                      {item?.title[router.locale]}
                    </GroupButton>
                  </a>
                </div>
              ))}
            </div>
            <div
              className={classNames(styles.top, {
                [styles.active]: isFixedCatalog,
              })}
            >
              <Navbar type="catalog">
                <div className={styles.catalogNavbar}>
                  <div className={styles.wrapper} ref={catalogMenuRef}>
                    {categories?.map((category) => (
                      <div key={category.id}>
                        <a href={`#${category.title.en}`}>
                          <GroupButton
                            size="sm"
                            active={activeCategory?.includes(category.title.en)}
                          >
                            {category.title[router.locale]}
                          </GroupButton>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </Navbar>
            </div>
          </div>
          <section ref={catalogRef}>
            {categories?.map((category) => (
              <div
                key={category.id}
                id={category.title.en}
                className={styles.section}
              >
                <h2>{category.title[router.locale]}</h2>
                <Grid
                  container
                  spacing={{ xs: 2, lg: 2 }}
                  columns={{ xs: 2, sm: 3, md: 4, lg: 4 }}
                >
                  {category?.products &&
                    category?.products?.map((product) => (
                      <Grid item key={product.id} xs={1}>
                        {product.type === 'combo' ? (
                          <ComboCard product={product} />
                        ) : product.type === 'origin' ? (
                          <OriginCard product={product} />
                        ) : (
                          <Card product={product} />
                        )}
                      </Grid>
                    ))}
                </Grid>
              </div>
            ))}
          </section>
        </Container>
      </main>
      <FormDialog
        open={successDialog}
        title={t('successfully')}
        subtitle={t('order_no') + orderIds?.external_order_id}
        descr={t('order_success-text')}
        handleClose={() => dispatch(clearOrderIds())}
        usedFor="success"
      >
        <Link href={`/myorders/${orderIds?.order_id}`}>
          <a>
            <Button onClick={() => dispatch(clearOrderIds())}>
              {t('go_to_my_orders')}
            </Button>
          </a>
        </Link>
      </FormDialog>
      {activePopup && notifications.length > 0 && (
        <PopupAlert
          open={notifications.some((obj) => obj.id === activePopup.id)}
          data={activePopup}
          handleClose={onClosePopup}
        />
      )}
    </>
  )
}

export default memo(Main)
