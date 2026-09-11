import { useEffect } from 'react';
import { nextTourStop, tourDwell } from '../catalog.js';
export const TOUR_IDLE_MS = 90000;
export function tourDecision(state, now, clocks) {
  if (!state.ready || state.hidden || state.menu || state.panel || state.stage !== 'idle') return null;
  if (!state.auto) return now - clocks.idle >= TOUR_IDLE_MS ? {
    type: 'resume'
  } : null;
  return now - clocks.dwell >= tourDwell(state.actual, state.point) ? {
    type: 'navigate',
    ...nextTourStop(state.actual, state.point)
  } : null;
}
export function useGuidedTour({
  latest,
  idle,
  dwell,
  setAuto,
  navigate
}) {
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const decision = tourDecision({
        ...latest.current,
        hidden: document.hidden
      }, now, {
        idle: idle.current,
        dwell: dwell.current
      });
      if (!decision) return;
      dwell.current = now;
      if (decision.type === 'resume') setAuto(true);else navigate(decision.scene, decision.point, null, {
        remember: false,
        touring: true
      });
    }, 500);
    return () => clearInterval(timer);
  }, []);
}
