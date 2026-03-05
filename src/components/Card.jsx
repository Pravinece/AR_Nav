import styles from './Card.module.css'
import { clsx } from 'clsx'

const Card = ({ className, children, ...props }) => {
  return (
    <div className={clsx(styles.card, className)} {...props}>
      {children}
    </div>
  )
}

const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={clsx(styles.cardHeader, className)} {...props}>
      {children}
    </div>
  )
}

const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3 className={clsx(styles.cardTitle, className)} {...props}>
      {children}
    </h3>
  )
}

const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={clsx(styles.cardContent, className)} {...props}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardContent }
