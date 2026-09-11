import { categoriesFor } from '../core/product-categories.js';
import { point, view } from '../core/scene-definition.js';
export const productWallPoints = domain => categoriesFor(domain).filter(c=>c.wall).map(c=>point(c.point,c.name,[8.2,1.7,c.wall.z],view([4.6,1.8,c.wall.z+.3],[8.65,1.55,c.wall.z]),{type:'roomProducts',id:c.wall.product,category:c.id}));
