import { Link } from 'react-router-dom'

const base =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-all duration-200 ' +
  'focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98]'

const variants = {
  primary: 'btn-primary hover:shadow-medium hover:-translate-y-1',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  accent: 'btn-accent hover:shadow-medium hover:-translate-y-1',
  danger: 'btn-danger hover:shadow-medium',
}

const sizes = {
  sm: 'text-xs px-3 py-2',
  md: 'text-sm px-5 py-3',
  lg: 'text-base px-6 py-3.5',
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
