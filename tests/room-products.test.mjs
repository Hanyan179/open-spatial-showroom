import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { validateRoomProducts, roomText } from '../src/spatial/room-products.js';
import { categoryById } from '../src/spatial/core/product-categories.js';
import { SCENES,PRODUCT_DOMAINS,sceneForDomain } from '../src/spatial/core/scene-registry.js';
const data = JSON.parse(await fs.readFile(new URL('../public/data/room-products.json', import.meta.url)));
test('example products connect original illustrations, bilingual details and guided room stops', async () => {
  validateRoomProducts(data);
  assert(data.products.length >= 9, 'existing source selections remain available');
  for (const domain of PRODUCT_DOMAINS) {
    const room=sceneForDomain(domain);
    const products = data.products.filter(p => p.domain === domain);
    assert(products.length > 0);
    for (const p of products) {
      const point = room.points.find(v => v.id === p.point);
      assert.equal(point.action.type, 'roomProducts');
      assert(point, 'product can share an existing exhibit viewpoint');
      assert(['original-scene-interpretation','image-only'].includes(p.modelKind));
      assert.equal(p.sourceUrl,null, 'bundled examples have no private source site');
      assert(p.concept);
      assert(p.sku.startsWith('DEMO-'));
      assert(roomText(p.description, 'en'));
      assert(roomText(p.sceneNote, 'zh'));
      await fs.access(new URL('../public' + p.image, import.meta.url));
    }
    for (const p of data.related[domain] || []) {
      assert.equal(p.sourceUrl, null);
      assert(p.concept);
    }
    const b = await fs.readFile(new URL('../public/models/scenes/' + room.resource + '.glb', import.meta.url));
    const doc = JSON.parse(b.toString('utf8', 20, 20 + b.readUInt32LE(12)));
    for (const point of room.points.filter(p=>p.action.type==='roomProducts')) {
      const p=products.find(p=>p.id===point.action.id);
      assert(p, 'primary exhibit resolves to a product');
      assert(doc.nodes.some(n => n.extras?.productReference?.id === p.id), 'source image mount survived batching');
      assert(doc.nodes.some(n => n.mesh !== undefined && n.extras?.action?.id === p.id), 'physical model remains clickable');
    }
  }
  assert.equal(data.products.find(p => p.id === 'play-telescope').brand, null, 'undefined source brands stay unassigned');
});
test('invalid product feeds fail visibly instead of accepting duplicate or unsafe source references', async () => {
  assert.throws(() => validateRoomProducts({
    ...data,
    products: [data.products[0], data.products[0]]
  }));
  for (const key of ['sourceUrl', 'image']) assert.throws(() => validateRoomProducts({
    products: [{
      ...data.products[0],
      [key]: 'javascript:alert(1)'
    }]
  }));
});
test('a backend feed can resolve product media on its own origin', async () => {
  const p = {
    ...data.products[0],
    image: 'images/product.png'
  };
  const result = validateRoomProducts({
    products: [p],
    related: {}
  }, 'https://content.example/api/products.json');
  assert.equal(result.products[0].image, 'https://content.example/api/images/product.png');
});
test('each product category is visible from its intended viewing position', async () => {
  const T = await import('three'),
    {
      buildScene
    } = await import('../src/spatial/build-scenes.js'),
    {
      disposeGroup
    } = await import('../src/spatial/runtime.js');
  for (const id of Object.values(SCENES).filter(s=>s.domain).map(s=>s.id)) {
    const {
      root
    } = await buildScene(id);
    root.updateMatrixWorld(true);
    const from = new T.Vector3(...SCENES[id].overview.position);
    for (const point of SCENES[id].points) {
      const camera = categoryById(point.action.category)?.wall ? new T.Vector3(...point.camera.position) : from;
      const direction = new T.Vector3(...point.anchor).sub(camera),
        ray = new T.Raycaster(camera, direction.clone().normalize(), 0, direction.length() - .85);
      const obstruction = ray.intersectObject(root, true).find(h => !h.object.material?.transparent);
      assert(!obstruction, `${id}/${point.id} is blocked by ${obstruction?.object.parent.name}`);
    }
    disposeGroup(root);
  }
});
