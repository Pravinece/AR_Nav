import { forwardRef } from 'react'
import styles from './Button.module.css'
import { clsx } from 'clsx'

const Button = forwardRef(({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
  return (
    <button
      className={clsx(styles.button, styles[variant], styles[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }
