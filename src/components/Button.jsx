import { Loader2 } from 'lucide-react';

/**
 * Reusable Liquid Glass Button Component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button label or content
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} [props.variant='primary'] - Style variant
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size
 * @param {boolean} [props.isLoading=false] - Shows loading spinner and disables click
 * @param {boolean} [props.disabled=false] - Disables button
 * @param {React.ReactNode} [props.icon] - Optional Lucide icon to display before label
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] - HTML button type
 * @param {string} [props.className=''] - Additional Tailwind CSS classes
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon = null,
  type = 'button',
  className = '',
  onClick,
  ...rest
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#FF1A24] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 select-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-4.5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'glass-button-primary text-white font-bold',
    secondary: 'glass-button-secondary text-white font-semibold',
    outline: 'glass-button-outline text-zinc-200 hover:text-white',
    ghost:
      'bg-transparent hover:bg-white/10 text-zinc-300 hover:text-white backdrop-blur-sm',
    danger:
      'bg-gradient-to-r from-[#E50914] to-[#B20710] hover:from-[#FF1A24] hover:to-[#E50914] text-white shadow-lg shadow-[#E50914]/25 border border-red-500/30',
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;
  const currentVariant = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${currentSize} ${currentVariant} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0 flex items-center">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
