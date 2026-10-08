import { useLayoutEffect, useState } from 'react';

export default function useFloatingPanel(open, trigger, panel, onClose, width) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 280, maxHeight: 320, visibility: 'hidden' });
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const box = trigger.current?.getBoundingClientRect();
      if (!box) return;
      const panelWidth = Math.min(width || Math.max(box.width, 240), window.innerWidth - 32);
      const availableBelow = window.innerHeight - box.bottom - 24;
      const above = availableBelow < 220 && box.top > availableBelow;
      const maxHeight = Math.min(420, Math.max(150, above ? box.top - 24 : availableBelow));
      const height = Math.min(panel.current?.scrollHeight || 320, maxHeight);
      setPosition({ width: panelWidth, maxHeight, left: Math.max(16, Math.min(box.left, window.innerWidth - panelWidth - 16)), top: above ? Math.max(16, box.top - height - 8) : box.bottom + 8, visibility: 'visible' });
    };
    const outside = event => { if (!trigger.current?.contains(event.target) && !panel.current?.contains(event.target)) onClose(false); };
    place();
    const observer = new ResizeObserver(place);
    if (panel.current) observer.observe(panel.current);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('pointerdown', outside);
    return () => { observer.disconnect(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); document.removeEventListener('pointerdown', outside); };
  }, [open, width]);
  return position;
}
