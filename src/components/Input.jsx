import { forwardRef } from 'react'
import styles from './Input.module.css'
import { clsx } from 'clsx'

const Input = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      className={clsx(styles.input, className)}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input }
