import { Link } from 'react-router-dom'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors ' +
  'disabled:opacity-60 disabled:pointer-events-none'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary:
    'bg-surface text-ink border border-border-strong hover:bg-surface-muted',
  ghost: 'text-ink hover:bg-surface-muted',
  accent: 'bg-accent text-white hover:bg-accent-hover',
  danger: 'bg-error text-white hover:bg-red-800',
}

const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
}

export default function Button({
  as = 'button',
  to,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...rest
}) {
  const classes = `${base} ${variants[variant] || variants.primary} ${
    sizes[size] || sizes.md
  } ${className}`

  if (as === 'link' || to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }
  if (as === 'a' || href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}