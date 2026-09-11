import { createContactShadows } from './rendering/contact-shadows.js';
import { createRoomAmbient } from './ambient.js';
import { createCompanyMedia } from './company-media.js';
import { createProductReferences } from './product-references.js';
import { createExhibitResources } from './exhibit-resources.js';
import { createWorkingDisplays } from './working-displays.js';

// A cached room owns these resources. Factories detect their own GLB mount tags.
export const ROOM_FEATURES = {
  contactShadows: createContactShadows,
  ambient: createRoomAmbient,
  companyMedia: createCompanyMedia,
  productReferences: createProductReferences,
  exhibits: createExhibitResources,
  workingDisplays: createWorkingDisplays
};
export function installRoomFeatures(root, factories = ROOM_FEATURES) {
  const installed = [];
  try {
    for (const [key, create] of Object.entries(factories)) {
      root[key] = create(root);
      if (root[key]) installed.push(root[key]);
    }
  } catch (error) {
    installed.reverse().forEach(feature => feature.dispose?.());
    throw error;
  }
  let disposed = false;
  root.disposeFeatures = () => {
    if (disposed) return;
    disposed = true;
    installed.reverse().forEach(feature => feature.dispose?.());
  };
}
