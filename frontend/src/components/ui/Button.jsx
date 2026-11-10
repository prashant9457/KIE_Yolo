import { forwardRef } from 'react';

const Button = forwardRef(function Button(
  {
    children,
    variant = 'secondary',
    size = 'md',
    iconOnly = false,
    trailingIcon: TrailingIcon,
    href,
    className = '',
    type = 'button',
    ...props
  },
  ref,
) {
  const Element = href ? 'a' : 'button';
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    iconOnly && 'button--icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Element ref={ref} className={classes} href={href} type={href ? undefined : type} {...props}>
      {children}
      {TrailingIcon && (
        <span className="button__trailing">
          <TrailingIcon size={16} />
        </span>
      )}
    </Element>
  );
});

export default Button;
