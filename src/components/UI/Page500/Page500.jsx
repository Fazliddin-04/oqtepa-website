import Image from 'next/image'
import { Container } from '@mui/material'
import useTranslation from 'next-translate/useTranslation'
import styles from './style.module.scss'
import Button from '../Button/Button'

export default function Page500() {
  const { t } = useTranslation('about')
  return (
    <Container>
      <div className={styles.content}>
        <Image
          src="/images/servererror.png"
          width={256}
          height={255}
          alt="Server Error"
          priority={true}
        />
        <h1>
          <span>500</span> <br />
          Internal server error
        </h1>
        <p>We are currently trying to fix the problem.</p>
        <Button
          onClick={() => window.location.reload()}
          style={{ width: 'fit-content' }}
        >
          Try Again
        </Button>
      </div>
    </Container>
  )
}
