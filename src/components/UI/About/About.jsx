import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { Container } from '@mui/material'
import styles from './style.module.scss'

export function About() {
  const { t } = useTranslation('about')

  return (
    <Container>
      <div className={styles.about}>
        <h2 className={styles.title}>{t('about_company')}</h2>
        <div className={styles.image}>
          <Image
            src={'/images/about.jpg'}
            priority={true}
            alt="Oqtepa lavash"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <p dangerouslySetInnerHTML={{ __html: t('about_text') }}></p>
      </div>
    </Container>
  )
}
