import Link from 'next/link'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
// Utils
import useSWR from 'swr'
import { fetcher } from 'utils/fetcher'
// MUI
import { Container } from '@mui/material'
import { Instagram, FacebookOutlined } from '@mui/icons-material'
// Style
import styles from './style.module.scss'

export function Footer() {
  const { t } = useTranslation('common')

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.footer_content}>
          <Link href="/">
            <a>
              <div className={styles.logo}>
                <Image
                  src="/images/bot_logo.png"
                  alt="LOGO"
                  priority={true}
                  objectFit="cover"
                  layout="fill"
                />
              </div>
            </a>
          </Link>
          <ul className={styles.list}>
            <li>
              <Link href="/">
                <a>{t('menu')}</a>
              </Link>
            </li>
            <li>
              <Link href="/branches">
                <a>{t('branches')}</a>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <a>{t('about')}</a>
              </Link>
            </li>
            <li>
              <Link href="/contacts">
                <a>{t('contacts')}</a>
              </Link>
            </li>
          </ul>
          <div className={styles.social}>
            <a
              href="https://www.instagram.com/oqtepalavash.official/"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram />
            </a>
            <a
              href="http://fb.me/oqtepalavash.official/"
              target="_blank"
              rel="noreferrer"
            >
              <FacebookOutlined />
            </a>
          </div>
        </div>
        <div className={styles.footer_bottom}>
          <p>&copy; Oqtepa Lavash 2010 - {new Date().getFullYear()} </p>
        </div>
      </Container>
    </footer>
  )
}
