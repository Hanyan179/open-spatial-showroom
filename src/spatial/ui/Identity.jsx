import {useEffect,useState} from 'react';
import {loadConfiguration,webUrl} from '../resource-client.js';
export default function Identity({lang='zh'}) {
 const [identity,setIdentity]=useState(null);
 useEffect(()=>{let alive=true;loadConfiguration().then(c=>{if(alive)setIdentity(c.identity);}).catch(()=>{});return()=>{alive=false;};},[]);
 const label=identity?.title?.[lang]||(lang==='zh'?'三维交互展厅':'Interactive 3D Showroom');
 return identity?.logoUrl&&webUrl(identity.logoUrl)?<img src={webUrl(identity.logoUrl)} alt={label}/>:<span className="identity-title">{label}</span>;
}
