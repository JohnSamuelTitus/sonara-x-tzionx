import React from 'react';

export type KeycapVariant = 'primary' | 'deck' | 'gold' | 'ivory' | 'danger';
export type KeycapShape = 'circle' | 'square' | 'pill';
export type KeycapSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface KeycapButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: KeycapVariant;
  shape?: KeycapShape;
  size?: KeycapSize;
  active?: boolean;
  hasLed?: boolean;
  ledActive?: boolean;
  tooltip?: string;
  icon?: React.ReactNode;
}

export const KeycapButton: React.FC<KeycapButtonProps> = ({
  variant = 'deck',
  shape = 'square',
  size = 'md',
  active = false,
  hasLed = false,
  ledActive = false,
  tooltip,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Size classes
  const sizeClasses: Record<KeycapSize, string> = {
    xs: 'h-7 min-w-[28px] px-2 text-[10px] gap-1',
    sm: 'h-8 min-w-[32px] px-2.5 text-xs gap-1.5',
    md: 'h-10 min-w-[40px] px-3.5 text-xs gap-2',
    lg: 'h-12 min-w-[48px] px-4 text-sm gap-2.5',
    xl: 'h-14 min-w-[56px] px-5 text-base gap-3',
  };

  // Shape classes
  const shapeClasses: Record<KeycapShape, string> = {
    circle: 'keycap-circle p-0 aspect-square',
    square: 'keycap-square',
    pill: 'keycap-pill',
  };

  // Variant classes mapping to index.css
  const variantClass = `keycap-${variant}`;
  const activeClass = active ? 'keycap-toggle-active' : '';

  return (
    <button
      {...props}
      disabled={disabled}
      title={tooltip}
      className={`keycap-base ${variantClass} ${shapeClasses[shape]} ${sizeClasses[size]} ${activeClass} ${className}`}
    >
      {hasLed && (
        <span
          className={`led-pip ${ledActive || active ? 'led-pip-active' : ''} flex-shrink-0`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="flex-shrink-0 flex items-center justify-center">{icon}</span>}
      {children && <span className="truncate">{children}</span>}
    </button>
  );
};
