import { memo, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useSelector, useDispatch } from 'react-redux'
// Redux Store
import { removePoint } from 'store/common/commonSlice'
// MUI
import { Container, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
// Components
import Button from '../Button/Button'
import MapDialog from '../MapDialog/MapDialog'
// Style
import styles from './style.module.scss'

function MyAddresses() {
  const [isMapDialog, setIsMapDialog] = useState(false)
  const [pointAddress, setPointAddress] = useState(null)

  const { points } = useSelector((state) => state.common)

  const dispatch = useDispatch()
  const { t } = useTranslation('common')

  if (points.length === 0) {
    return (
      <div className={styles.empty}>
        <Container>
          <div className={styles.box}>
            <h3>{t('your_basket_is_empty')}</h3>
            <p>{t('the_items_you_order_will_appear_here')}</p>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <>
      <div className={styles.my_addresses}>
        <Container>
          <h2>{t('my_address')}</h2>
          <div className={styles.box}>
            {points.map((point) => (
              <div className={styles.card} key={point.address}>
                <div>
                  <h3>{point.address}</h3>
                </div>
                <div className={styles.card_actions}>
                  <IconButton
                    aria-label="edit"
                    onClick={() => {
                      setPointAddress(point)
                      setIsMapDialog(true)
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={() => {
                      dispatch(removePoint(point.id))
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
            ))}
            <div className={styles.actions}>
              <Button
                style={{ maxWidth: '326px' }}
                onClick={() => {
                  setPointAddress(null)
                  setIsMapDialog(true)
                }}
              >
                {t('add_address')}
              </Button>
            </div>
          </div>
        </Container>
      </div>
      <MapDialog
        open={isMapDialog}
        point={pointAddress}
        setPoint={setPointAddress}
        title={t('enter_a_delivery_address')}
        handleClose={() => setIsMapDialog(false)}
      />
    </>
  )
}

export default memo(MyAddresses)
