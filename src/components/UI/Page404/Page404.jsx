import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@mui/material'
import useTranslation from 'next-translate/useTranslation'
import styles from './style.module.scss'
import Button from '../Button/Button'

export default function Page404() {
  const { t } = useTranslation('about')
  return (
    <Container>
      <div className={styles.content}>
        <Image
          src="/images/notfound.png"
          width={256}
          height={255}
          alt="not Found"
          priority={true}
        />
        <h1>
          <span>404</span> <br />
          Page not found
        </h1>
        <p>The resource requested could not be found in this server.</p>
        <Link href="/">
          <a>
            <Button style={{ width: 'fit-content' }}>Go Back to Home</Button>
          </a>
        </Link>
      </div>
    </Container>
  )
}
