import { Film, Loader2 } from 'lucide-react';

/**
 * Reusable Loading Component with Liquid Glass Treatment
 *
 * @param {Object} props
 * @param {string} [props.message='Loading...'] - Custom message to display
 * @param {boolean} [props.fullScreen=false] - Whether to render centered in full viewport
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Spinner size
 * @param {string} [props.className=''] - Additional Tailwind CSS classes
 */
const Loading = ({
  message = 'Loading...',
  fullScreen = false,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-5 h-5', film: 'w-4 h-4', text: 'text-xs', container: 'p-4' },
    md: { icon: 'w-8 h-8', film: 'w-6 h-6', text: 'text-sm', container: 'p-8' },
    lg: { icon: 'w-12 h-12', film: 'w-8 h-8', text: 'text-base', container: 'p-12' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`glass-panel rounded-3xl flex flex-col items-center justify-center text-center gap-3.5 shadow-2xl ${currentSize.container} ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer subtle glowing pulse ring */}
        <div className="absolute inset-0 rounded-full bg-[#E50914]/20 animate-ping" />
        
        {/* Center Film icon */}
        <Film className={`${currentSize.film} text-[#FF1A24]`} aria-hidden="true" />
        
        {/* Spinning border ring */}
        <Loader2
          className={`absolute ${currentSize.icon} text-[#FF1A24] animate-spin`}
          aria-hidden="true"
        />
      </div>

      {message && (
        <p className={`text-zinc-300 font-semibold tracking-wide ${currentSize.text}`}>
          {message}
        </p>
      )}
      <span className="sr-only">Loading content, please wait</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050505]/75 backdrop-blur-md z-50 p-4">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
