import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Link } from 'react-router-dom';
import { cx, type ButtonSize, type ButtonVariant } from './Button';
import styles from './Button.module.css';

export interface LinkButtonProps extends ComponentPropsWithoutRef<typeof Link> {
  fullWidth?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ className, fullWidth = false, size = 'md', variant = 'primary', ...props }, ref) => (
    <Link ref={ref} className={cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)} {...props} />
  ),
);

LinkButton.displayName = 'LinkButton';

