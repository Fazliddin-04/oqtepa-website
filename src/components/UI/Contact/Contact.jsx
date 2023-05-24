import QRCode from 'react-qr-code'
import useTranslation from 'next-translate/useTranslation'
import { Container } from '@mui/material'
import TelegramIcon from '@mui/icons-material/Telegram'
import styles from './style.module.scss'

export function Contact() {
  const { t } = useTranslation('common')

  return (
    <div className={styles.contacts}>
      <Container>
        <h2>{t('contacts')}</h2>
        <div>
          <div className={styles.flexbox_wrap}>
            <div>
              <img
                src="/images/contacts_img.jpg"
                alt="contacts"
                className={styles.contacts_cover_img}
              />
              <p>
                <strong>{t('single_call_center')}</strong>
                <br />
                <span>
                  <a href={`tel:+998901234567`}>+998901234567</a>
                </span>
              </p>
              <p>
                <strong>{t('telegram_bot')}</strong>
                <br />
                <a
                  href={`https://t.me/example_bot`}
                  target="_blank"
                  rel="noreferrer"
                >
                  t.me/example_bot
                </a>
              </p>
            </div>
            <div className={styles.contacts_details}>
              <div className={styles.qr_code}>
                <QRCode
                  value={`https://t.me/Oqtepalavash_TM`}
                  size={256}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  viewBox={`0 0 256 256`}
                />
              </div>
              <p dangerouslySetInnerHTML={{ __html: t('contact_text') }}></p>
              <a
                href={`https://t.me/Oqtepalavash_TM`}
                className={styles.flexbox_align_center}
                target="_blank"
                rel="noreferrer"
              >
                <TelegramIcon />
                @Oqtepalavash_TM
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
