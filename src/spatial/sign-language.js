// Physical signs share the host language. Brand names and exhibit codes remain intact.
const pairs = [
 ['WELCOME','欢迎光临'],['WELCOME TO THE SHOWROOM','欢迎来到展厅'],['SHOWROOM','展厅'],['PRODUCT','产品'],['EXPLORE','开始探索'],
 ['DESIGN','设计'],['GLOBAL CONNECTIONS','全球连接'],
 ['CONNECTED CAPABILITIES','连接各地能力'],['WORKSPACE','工作空间'],['PROCESS','加工流程'],['CONCEPT','概念示意'],
 ['SAMPLE / REVIEW','样品检查'],['REFERENCE / REVIEW / RECORD','参照 · 检查 · 记录'],
 ['PACK / CONSOLIDATE / DISPATCH','包装 · 集货 · 发运'],['FORM / COLOUR','造型与色彩'],['DESIGN STUDY','设计研究'],
 ['IDEAS → FORM → DETAIL','创意 → 造型 → 细节'],['COMPARE','对比研究'],['COLOUR / MATERIAL / FINISH','色彩 · 材料 · 表面工艺'],
 ['MODEL / SAMPLE / DEVELOPMENT','模型 · 样品 · 开发'],['CONTEXT / PROPOSAL / FEEDBACK','场景 · 提案 · 反馈'],
 ['LISTEN / REVIEW / ALIGN','倾听 · 讨论 · 共识'],['REQUIREMENTS','需求'],['NEXT STEPS','下一步'],
 ['LOCAL / CONNECT','本地团队 · 全球协作'],['MARKET / TEAM / PRODUCT','市场 · 团队 · 产品'],['COORDINATION','协作安排'],
 ['China','中国'],['United States','美国'],['Cambodia','柬埔寨'],
 ['LUSTRE','鎏光'],['LIP COLOR','唇色'],['BLUE RITUAL','澄蓝'],['SKINCARE','护理'],
 ['PRODUCT LIBRARY','产品资料库'],['NEWS & STORIES','新闻与动态'],['SHOWROOM JOURNAL','展厅来信'],
 ['COMING SOON','内容即将更新'],['PARTNERS','合作伙伴']
];
const enToZh=new Map(pairs),zhToEn=new Map(pairs.map(([en,zh])=>[zh,en]));
const han=s=>/[\u3400-\u9fff]/u.test(s);
export function signLines(sign,lang='zh'){
 if(sign.i18n)return [].concat(sign.i18n[lang]||sign.i18n.zh);
 const lines=[].concat(sign.text||[]).map(String);
 if(lines.length===2&&han(lines[0])!==han(lines[1])&&!lines.some(s=>s.includes('SHOWROOM'))){
  return [lines.find(s=>han(s)===(lang==='zh'))];
 }
 return lines.map(s=>(lang==='zh'?enToZh:zhToEn).get(s)||s);
}
export function untranslatedSign(sign){
 const zh=signLines(sign,'zh'),en=signLines(sign,'en');
 return zh.filter(s=>/[a-z]/i.test(s)&&!s.includes('SHOWROOM')&&!/^(A|B|PRODUCT)$/i.test(s)&&en.includes(s));
}
