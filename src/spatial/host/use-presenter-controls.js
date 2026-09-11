import { useShowroom } from './ShowroomProvider.jsx';
import { presenterDestination, presenterKey, presenterPoint } from '../core/presenter-controls.js';
import { orderedStops } from '../core/areas.js';

export function usePresenterControls() {
  const { visit, commands } = useShowroom();
  const handler = useRef();
  handler.current = event => {
    const target = event.target;
    const command = presenterKey(event.key, {
      ...visit,
      editing: Boolean(target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),video,audio,[role="slider"]')),
      interactive: Boolean(target.closest?.('button,a[href],[role="button"]')),
      repeat: event.repeat,
      modified: event.ctrlKey || event.metaKey || event.altKey || event.shiftKey
    });
    if (!command) {
      // With controls hidden, an ordinary key on the unfocused scene reveals
      // them too. Leave focused controls and editable content to native input.
      if (!event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey &&
          !target.closest?.('button,a[href],input,textarea,select,[contenteditable],video,audio,[role="slider"]') &&
          !visit.overlay && visit.ready) commands.interaction();
      return false;
    }
    event.preventDefault();
    if (command === 'play') commands.setPlaying();
    else {
      commands.interaction();
      if (command === 'next' || command === 'previous') {
        const stop = presenterDestination(visit.actual, visit.point, command === 'next' ? 1 : -1);
        commands.navigate(stop.scene, stop.point);
      } else if (command === 'menu') commands.openMenu();
      else if (command === 'back') commands.back();
      else if (command === 'open') {
        const stop = presenterPoint(visit.actual, visit.point);
        if (stop) commands.clickedAction(stop.action);
        else {
          const first = orderedStops(visit.scene)[0];
          if (first) commands.navigate(visit.actual, first.id);
        }
      }
    }
    return true;
  };
  useEffect(() => {
    const key = event => { if (!event.defaultPrevented) handler.current(event); };
    // A remote/keyboard also works when the canvas click leaves focus on body.
    window.addEventListener('keydown', key, true);
    return () => window.removeEventListener('keydown', key, true);
  }, []);
}
import { useEffect, useRef } from 'react';
