import { createContext, useContext } from 'react';
import useShowroomController from './use-showroom-controller.js';
const ShowroomContext = createContext(null);
export function ShowroomProvider({
  children
}) {
  const controller = useShowroomController();
  return <ShowroomContext.Provider value={controller}>{children}</ShowroomContext.Provider>;
}
export function useShowroom() {
  const value = useContext(ShowroomContext);
  if (!value) throw Error('Showroom UI must be inside ShowroomProvider');
  return value;
}
