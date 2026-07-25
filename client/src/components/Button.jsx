const VARIANT_CLASSES = {
  primary:
    'bg-primary text-white hover:bg-primary-hover',
  secondary:
    'border border-gray-300 text-gray-700 hover:bg-gray-50',
  ghost:
    'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
  danger:
    'bg-red-600 text-white hover:bg-red-700',
  icon: {
    base: 'hover:bg-violet-50',
    success: 'text-green-600 hover:text-green-700 hover:bg-green-50',
    warning: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
    danger: 'text-red-500 hover:text-red-700 hover:bg-red-50',
  },
}

const COMMON =
  'inline-flex items-center justify-center rounded-lg min-h-[48px] transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

export function Button({
  variant = 'primary',
  tone,
  type = 'button',
  disabled,
  className = '',
  onClick,
  children,
  ...rest
}) {
  const base =
    variant === 'icon'
      ? VARIANT_CLASSES.icon[tone] || VARIANT_CLASSES.icon.base
      : VARIANT_CLASSES[variant]

  const sizing = variant === 'icon' ? 'p-2.5' : 'px-5 gap-2 font-semibold text-button'

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${COMMON} ${base} ${sizing} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
