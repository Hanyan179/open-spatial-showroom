import { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';
export default function Dialog({
  title,
  close,
  children,
  className
}) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.focus({preventScroll:true});
    const key = e => {
      if (e.key !== 'Tab') return;
      const all = [...ref.current.querySelectorAll('button:not([disabled]),input')],
        first = all[0],
        last = all.at(-1);
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    ref.current?.addEventListener('keydown', key);
    return () => {
      ref.current?.removeEventListener('keydown', key);
      previous?.focus?.({preventScroll:true});
    };
  }, []);
  return <div className="dialog-backdrop" onClick={e => {
    if (e.target === e.currentTarget) close();
  }}><section className={className} ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}><button className="dialog-close" onClick={close} aria-label={title === '电梯' ? '关闭电梯' : 'Close elevator'}><X /></button>{children}</section></div>;
}
