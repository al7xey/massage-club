import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cx } from '@/shared/ui/button';
import styles from './FormControls.module.css';

interface FieldChromeProps {
  endAdornment?: ReactNode;
  error?: string;
  helperText?: string;
  id?: string;
  label: string;
}

export interface TextFieldProps extends FieldChromeProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {}
export interface SelectFieldProps extends FieldChromeProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {}
export interface TextAreaFieldProps extends FieldChromeProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({ className, endAdornment, error, helperText, id, label, ...props }, ref) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-message`;

  const input = (
    <input
      ref={ref}
      aria-describedby={error || helperText ? messageId : undefined}
      aria-invalid={error ? true : undefined}
      className={cx(styles.control, error && styles.invalid, Boolean(endAdornment) && styles.controlWithAdornment, className)}
      id={controlId}
      {...props}
    />
  );

  return (
    <label className={styles.field} htmlFor={controlId}>
      {label.trim() ? <span className={styles.label}>{label}</span> : null}
      {endAdornment ? (
        <span className={styles.controlWrap}>
          {input}
          <span className={styles.adornment}>{endAdornment}</span>
        </span>
      ) : (
        input
      )}
      <FieldMessage error={error} helperText={helperText} id={messageId} />
    </label>
  );
});

TextField.displayName = 'TextField';

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(({ children, className, endAdornment: _endAdornment, error, helperText, id, label, ...props }, ref) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-message`;

  return (
    <label className={styles.field} htmlFor={controlId}>
      {label.trim() ? <span className={styles.label}>{label}</span> : null}
      <select
        ref={ref}
        aria-describedby={error || helperText ? messageId : undefined}
        aria-invalid={error ? true : undefined}
        className={cx(styles.control, styles.select, error && styles.invalid, className)}
        id={controlId}
        {...props}
      >
        {children}
      </select>
      <FieldMessage error={error} helperText={helperText} id={messageId} />
    </label>
  );
});

SelectField.displayName = 'SelectField';

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(({ className, endAdornment: _endAdornment, error, helperText, id, label, ...props }, ref) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-message`;

  return (
    <label className={styles.field} htmlFor={controlId}>
      {label.trim() ? <span className={styles.label}>{label}</span> : null}
      <textarea
        ref={ref}
        aria-describedby={error || helperText ? messageId : undefined}
        aria-invalid={error ? true : undefined}
        className={cx(styles.control, styles.textarea, error && styles.invalid, className)}
        id={controlId}
        {...props}
      />
      <FieldMessage error={error} helperText={helperText} id={messageId} />
    </label>
  );
});

TextAreaField.displayName = 'TextAreaField';

function FieldMessage({ error, helperText, id }: { error?: string; helperText?: string; id: string }) {
  if (!error && !helperText) {
    return null;
  }

  return (
    <p className={error ? styles.error : styles.helper} id={id}>
      {error ?? helperText}
    </p>
  );
}

