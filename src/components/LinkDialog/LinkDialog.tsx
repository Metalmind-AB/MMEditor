import React, { useState, useEffect, useRef } from 'react';
import styles from './LinkDialog.module.css';

export interface LinkData {
  url: string;
  text?: string;
  target?: '_blank' | '_self';
}

interface LinkDialogProps {
  isOpen: boolean;
  initialData?: LinkData;
  onClose: () => void;
  onSubmit: (data: LinkData) => void;
  onRemove?: () => void;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
  isOpen,
  initialData,
  onClose,
  onSubmit,
  onRemove,
}) => {
  const [url, setUrl] = useState(initialData?.url || '');
  const [text, setText] = useState(initialData?.text || '');
  const [openInNewTab, setOpenInNewTab] = useState(initialData?.target === '_blank');
  const [error, setError] = useState<string>('');
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialData?.url || '');
      setText(initialData?.text || '');
      setOpenInNewTab(initialData?.target === '_blank');
      setError('');
      
      // Focus URL input when dialog opens
      setTimeout(() => {
        urlInputRef.current?.focus();
        urlInputRef.current?.select();
      }, 100);
    }
  }, [isOpen, initialData]);

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setError('URL is required');
      return false;
    }

    // Basic URL validation
    try {
      // Add protocol if missing
      let validUrl = url;
      if (!url.match(/^https?:\/\//)) {
        validUrl = 'https://' + url;
      }
      new URL(validUrl);
      return true;
    } catch {
      setError('Please enter a valid URL');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(url)) {
      return;
    }

    let finalUrl = url;
    // Add protocol if missing
    if (!url.match(/^https?:\/\//)) {
      finalUrl = 'https://' + url;
    }

    onSubmit({
      url: finalUrl,
      text: text || finalUrl,
      target: openInNewTab ? '_blank' : '_self',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.dialog} onKeyDown={handleKeyDown}>
        <h2 className={styles.title}>
          {initialData ? 'Edit Link' : 'Insert Link'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="link-url" className={styles.label}>
              URL
            </label>
            <input
              ref={urlInputRef}
              id="link-url"
              type="text"
              className={`${styles.input} ${error ? styles.error : ''}`}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder="https://example.com"
            />
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>

          <div className={styles.field}>
            <label htmlFor="link-text" className={styles.label}>
              Text (optional)
            </label>
            <input
              id="link-text"
              type="text"
              className={styles.input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Link text"
            />
          </div>

          <div className={styles.checkbox}>
            <input
              id="link-target"
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
            />
            <label htmlFor="link-target">
              Open in new tab
            </label>
          </div>

          <div className={styles.buttons}>
            {initialData && onRemove && (
              <button
                type="button"
                className={`${styles.button} ${styles.danger}`}
                onClick={onRemove}
              >
                Remove Link
              </button>
            )}
            <button
              type="button"
              className={`${styles.button} ${styles.secondary}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.primary}`}
            >
              {initialData ? 'Update' : 'Insert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};