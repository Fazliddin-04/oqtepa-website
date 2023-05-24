import { memo, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
// Slick js
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
// MUI Icons
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
// Style
import styles from './style.module.scss'
import classNames from 'classnames'

function Carousel({ multiple, list, size, children }) {
  const [nextSlick, setNextSlick] = useState(1)
  const [activeSlick, setActiveSlick] = useState(0)
  const router = useRouter()

  const settingsMultiple = {
    dots: false,
    infinite: false,
    speed: 500,
    swipeToSlide: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    className: `slider variable-width ${styles.sliderMultiple} ${
      size == 'small' ? styles.small : ''
    } `,
    nextArrow:
      children?.length - 2 === nextSlick || children?.length - 2 < nextSlick ? (
        <></>
      ) : (
        <SampleNextArrow />
      ),
    prevArrow: activeSlick === 0 ? <></> : <SamplePrevArrow />,
    beforeChange: (_, next) => {
      setNextSlick(next)
    },
    afterChange: (current) => {
      setActiveSlick(current)
    },
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    className: `slider ${styles.slider}`,
    dotsClass: `slick-dots ${styles.slickDots}`,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    afterChange: (current) => setActiveSlick(current),
    customPaging: (i) => (
      <div
        className={classNames(styles.dot, {
          [styles.active]: activeSlick === i,
        })}
      />
    ),
  }

  return (
    <div>
      {multiple ? (
        <Slider {...settingsMultiple}>{children}</Slider>
      ) : (
        <Slider {...settings}>
          {list?.map((item) => (
            <CustomSlide url={item.url} key={item.id}>
              <Image
                src={item.image}
                priority={true}
                objectFit="cover"
                alt={'title'}
                layout="fill"
                sizes="(max-width: 600px) 90vw, (max-width: 992px): 600px, (max-width: 1248px): 992px, 1200px"
              />
            </CustomSlide>
          ))}
        </Slider>
      )}
    </div>
  )
}

export default memo(Carousel)

function CustomSlide({ url, children }) {
  if (url) {
    return (
      <a
        href={url}
        target={
          url.includes(process.env.NEXT_PUBLIC_DOMAIN) ? '_self' : '_blank'
        }
        rel="noreferrer"
      >
        <div
          className={`${styles.slide} ${styles.linked}`}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {children}
        </div>
      </a>
    )
  }
  return <div className={styles.slide}>{children}</div>
}

function SampleNextArrow({ onClick }) {
  return (
    <div className={styles.slideNextBtn} onClick={onClick}>
      <ArrowForwardIosRoundedIcon />
    </div>
  )
}

function SamplePrevArrow({ onClick }) {
  return (
    <div className={styles.slidePrevBtn} onClick={onClick}>
      <ArrowBackIosRoundedIcon />
    </div>
  )
}
