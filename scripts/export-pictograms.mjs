import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Elevator, Handshake, Buildings } from '@phosphor-icons/react';
import fs from 'node:fs/promises';

// Original MIT-licensed Phosphor paths; also used by the runtime solid signs.
await fs.mkdir('public/media/icons', {recursive:true});
for(const [name,Icon] of Object.entries({elevator:Elevator,partners:Handshake,milestones:Buildings})) {
  for(const [tone,color] of [['navy','#1c3448'],['ivory','#f1e6d2']]) {
    const svg=renderToStaticMarkup(React.createElement(Icon,{size:256,color,weight:'regular'}));
    await fs.writeFile(`public/media/icons/${name}-${tone}.svg`,svg);
  }
}
