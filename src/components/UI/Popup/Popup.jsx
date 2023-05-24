import { useRouter } from 'next/router'
import Button from '../Button/Button'
import FormDialog from '../FormDialog/FormDialog'
import styles from './style.module.scss'

function PopupAlert({ open, data, handleClose }) {
  const router = useRouter()

  return (
    <FormDialog
      open={open}
      PaperAttr={{ 'data-cy': 'popup' }}
      title={data.title[router.locale]}
      descr={data.about[router.locale]}
      img={data.image}
      handleClose={handleClose}
      usedFor="alert"
      className={styles.popup_alert}
    >
      <a
        href={data.url}
        target={
          data.url.includes(process.env.NEXT_PUBLIC_DOMAIN) ? '_self' : '_blank'
        }
        rel="noreferrer"
      >
        <Button onClick={handleClose}>
          {data?.button && data.button[router.locale]}
        </Button>
      </a>
    </FormDialog>
  )
}

export default PopupAlert
