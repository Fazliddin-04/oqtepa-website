import { memo } from 'react'
import useTranslation from 'next-translate/useTranslation'
import numToPrice from 'utils/numToPrice'
import { Checkbox, FormControlLabel } from '@mui/material'
import Counter from '../Counter/Counter'
import styles from './style.module.scss'
import classNames from 'classnames'

function ModifierCheckbox({
  checked,
  quantity,
  name,
  single,
  label,
  outPrice,
  increase,
  decrease,
  isCompulsory,
  onChange,
}) {
  const { t } = useTranslation('common')

  return (
    <div
      className={classNames(styles.ModifierCheckbox, {
        [styles.single]: single,
      })}
    >
      <FormControlLabel
        name={name}
        control={<Checkbox color="primary" size="small" disableRipple />}
        label={label}
        onChange={onChange}
        checked={
          checked
            ? true
            : !checked
            ? false
            : isCompulsory
            ? isCompulsory
            : undefined
        }
      />
      {quantity > 0 && checked && (
        <div className={styles.counter}>
          <Counter
            size="sm"
            variable={quantity}
            onIncrease={increase}
            onDecrease={decrease}
            unstyled
          />
        </div>
      )}
      <div className={styles.flexbox}>
        <span>+ {numToPrice(outPrice !== '' ? outPrice : 0, t('sum'))}</span>
      </div>
    </div>
  )
}

export default memo(ModifierCheckbox)
