import { forwardRef } from 'react'
import Image from 'next/image'
// MUI
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Slide,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
// Style
import styles from './style.module.scss'
import classNames from 'classnames'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function FormDialog({
  img,
  open,
  title,
  descr,
  handleClose,
  PaperAttr,
  className,
  subtitle,
  usedFor,
  children,
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth={true}
      maxWidth={usedFor === 'map' ? 'lg' : usedFor === 'alert' ? 'sm' : 'xs'}
      className={classNames(styles.dialog, {
        [styles.map]: usedFor === 'map',
        [styles.success]: usedFor === 'success',
        [styles.authorization]: usedFor === 'auth',
        [styles.alert]: usedFor === 'alert',
        [className]: className,
      })}
      fullScreen={usedFor === 'map' && isMobile}
      TransitionComponent={Transition}
      PaperProps={{
        ...PaperAttr,
      }}
    >
      {usedFor === 'alert' && img && (
        <div className={styles.alert_image}>
          <Image
            src={process.env.BASE_URL + img}
            layout="fill"
            alt={title}
            priority={true}
            objectFit="contain"
          />
        </div>
      )}
      <DialogTitle
        className={classNames(styles.title, {
          [styles.titleS]: descr === undefined,
        })}
      >
        {title}
      </DialogTitle>
      <DialogContent className={styles.content}>
        {usedFor === 'success' && (
          <>
            <div style={{ marginTop: 10, marginBottom: 18 }}>
              <Image
                src="/images/success.png"
                width={120}
                height={120}
                alt="success"
                priority={true}
              />
            </div>
            <h3 className={styles.orderNo}>{subtitle}</h3>
          </>
        )}
        {descr && (
          <DialogContentText className={styles.descr}>
            {descr}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      {usedFor !== 'success' && (
        <DialogActions sx={{ padding: 0 }}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            className={styles.closeIcon}
          >
            <CloseIcon />
          </IconButton>
        </DialogActions>
      )}
    </Dialog>
  )
}
