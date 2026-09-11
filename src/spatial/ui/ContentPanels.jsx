import { ArrowRight, ArrowUpRight, GlobeHemisphereWest } from '@phosphor-icons/react';
import { SCENES } from '../catalog.js';
import { useShowroom } from '../host/ShowroomProvider.jsx';
import ProductRoomContent from '../ProductRoomContent.jsx';
import CompanyLifeContent from '../CompanyLifeContent.jsx';
import ResourceContent from '../ResourceContent.jsx';
import CompanyContent, { RegionContent } from '../CompanyContent.jsx';
import { sceneForDomain } from '../core/scene-registry.js';
import { regions } from '../core/regions.js';
export const CONTENT_PANELS = {
  'roomProducts': function RoomProductsPanel() {
    const {
      preferences: {
        lang
      },
      content: {
        panel,
        setPanel
      },
      refs: {
        productMemory,
        contentBack
      },
      commands: {
        navigate,
        explore
      }
    } = useShowroom();
    return <ProductRoomContent key={panel.domain} domain={panel.domain} category={panel.category} selectedId={panel.id} lang={lang} memory={productMemory} backHandler={contentBack} onSelect={id => setPanel(v => ({
      ...v,
      id
    }))} onVisit={(domain, at) => navigate(sceneForDomain(domain)?.id, at)} onConcepts={domain => explore({
      section: 'products',
      domain
    })} />;
  },
  'life': function LifePanel() {
    const {
      preferences: {
        lang
      },
      content: {
        panel,
        setPanel
      },
      refs: {
        lifeMemory
      }
    } = useShowroom();
    return <CompanyLifeContent lang={lang} kind={panel.kind} index={panel.index} memory={lifeMemory} onKind={kind => setPanel(v => ({
      ...v,
      kind,
      index: undefined
    }))} />;
  },
  'resource': function ResourcePanel() {
    const {
      preferences: {
        lang
      },
      content: {
        panel,
        setPanel,
        company
      },
      commands: {
        explore
      }
    } = useShowroom();
    return <ResourceContent partnerId={panel.partner} section={panel.id} domain={panel.domain} lang={lang} company={company} onSection={id => setPanel(v => ({
      ...v,
      id
    }))} onExplore={explore} />;
  },
  'company': function CompanyPanel() {
    const {
      preferences: {
        lang
      },
      content: {
        panel,
        setPanel,
        company
      },
      commands: {
        navigate,
        explore
      }
    } = useShowroom();
    if (!company) return null;
    return <CompanyContent year={panel.year} type={panel.id} company={company} lang={lang} onType={id => setPanel({
      type: 'company',
      id
    })} onExplore={explore} onScene={id => navigate(id)} />;
  },
  'region': function RegionPanel() {
    const {
      preferences: {
        lang
      },
      content: {
        panel
      },
      commands: {
        navigate,
        showPanel,
        explore
      }
    } = useShowroom();
    return <RegionContent key={panel.id} id={panel.id} chapter={panel.chapter} lang={lang} onChapter={chapter => {
      const p = SCENES[panel.id].points[chapter];
      navigate(panel.id, p.id, {
        type: 'region',
        id: panel.id,
        chapter
      });
    }} onScene={id => navigate(id, id === 'office' ? 'earth' : 'overview', null, {
      restore: true
    })} onCompany={id => showPanel({
      type: 'company',
      id
    }, true)} onExplore={explore} onContinue={chapter => {
      const next = SCENES[panel.id].points[chapter + 1];
      if (next) navigate(panel.id, next.id);else navigate('office', 'earth', null, {
        restore: true
      });
    }} />;
  },
  'regions': function RegionsPanel() {
    const {
      commands: {
        act
      },
      t
    } = useShowroom();
    return <div className="regions-selector"><div><span className="section-kicker">GLOBAL CONNECTIONS</span><h1>{t('从一个地区，\n走进一种能力。', 'A region.\nA different capability.')}</h1><p>{t('中国的创研、美国的市场团队、柬埔寨的制造与供应链，共同连接产品与客户。', 'Creative work in China, markets and teams in the US, and manufacturing in Cambodia connect products with customers.')}</p></div><nav>{regions.map(([id, zh, en, roleZh, roleEn]) => <button key={id} onClick={() => act({
          type: 'market',
          id
        })}><GlobeHemisphereWest /><span><strong>{t(zh, en)}</strong><small>{t(roleZh, roleEn)}</small></span><ArrowUpRight /></button>)}</nav></div>;
  },
  'europe': function EuropePanel() {
    const {
      commands: {
        showPanel
      },
      t
    } = useShowroom();
    return <article className="europe-copy"><span className="section-kicker">EUROPE / 欧洲</span><h1>{t('连接欧洲市场', 'Connecting with Europe')}</h1><p className="content-lead">{t('这是可扩展的地区示例，维护者可连接自己的内容。', 'An extensible region example. Connect your own content here.')}</p><p>{t('当前保留区域浏览入口。具体团队、场所、业务规模和设施资料尚未提供，不据此建立工厂场景。', 'This regional entry is available. Specific teams, premises, scale and facilities have not been supplied.')}</p><button className="content-link" onClick={() => showPanel({
        type: 'company',
        id: 'case'
      }, true)}>{t('查看示例说明', 'Explore the example')}<ArrowRight /></button></article>;
  }
};
