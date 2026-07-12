import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helper?: string
  error?: string
  /** Wrapper style */
  wrapStyle?: React.CSSProperties
}

/**
 * Input — standardized form input.
 * Wraps the native <input> with a label, helper text, and error state.
 * The base input appearance is globally normalized in index.css;
 * this component adds labeling, focus rings, and error state.
 */
export const Input: React.FC<InputProps> = ({
  label,
  helper,
  error,
  wrapStyle,
  id,
  style,
  ...rest
}) => {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', ...wrapStyle }}>
      {label && (
        <label htmlFor={inputId} className="form-label" style={{ marginBottom: 0 }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          borderColor: error ? 'var(--color-danger)' : undefined,
          ...style,
        }}
        {...rest}
      />
      {error && (
        <span className="helper-text" style={{ color: 'var(--color-danger-dark)' }}>
          {error}
        </span>
      )}
      {!error && helper && (
        <span className="helper-text">{helper}</span>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  helper?: string
  error?: string
  wrapStyle?: React.CSSProperties
  children: React.ReactNode
}

/**
 * Select — standardized select/dropdown.
 */
export const Select: React.FC<SelectProps> = ({
  label,
  helper,
  error,
  wrapStyle,
  id,
  style,
  children,
  ...rest
}) => {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', ...wrapStyle }}>
      {label && (
        <label htmlFor={selectId} className="form-label" style={{ marginBottom: 0 }}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        style={{
          borderColor: error ? 'var(--color-danger)' : undefined,
          ...style,
        }}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <span className="helper-text" style={{ color: 'var(--color-danger-dark)' }}>
          {error}
        </span>
      )}
      {!error && helper && (
        <span className="helper-text">{helper}</span>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helper?: string
  error?: string
  wrapStyle?: React.CSSProperties
}

/**
 * Textarea — standardized multiline input.
 */
export const Textarea: React.FC<TextareaProps> = ({
  label,
  helper,
  error,
  wrapStyle,
  id,
  style,
  ...rest
}) => {
  const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', ...wrapStyle }}>
      {label && (
        <label htmlFor={textareaId} className="form-label" style={{ marginBottom: 0 }}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        style={{
          borderColor: error ? 'var(--color-danger)' : undefined,
          ...style,
        }}
        {...rest}
      />
      {error && (
        <span className="helper-text" style={{ color: 'var(--color-danger-dark)' }}>
          {error}
        </span>
      )}
      {!error && helper && (
        <span className="helper-text">{helper}</span>
      )}
    </div>
  )
}

export default Input
