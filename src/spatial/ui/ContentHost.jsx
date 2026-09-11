import { ArrowLeft, X } from '@phosphor-icons/react';
import { useShowroom } from '../host/ShowroomProvider.jsx';
import ExplorerHost from '../ExplorerHost.jsx';
import { CONTENT_PANELS } from './ContentPanels.jsx';
export default function ContentHost() {
  const {
    visit: {
      scene
    },
    preferences: {
      lang,
      setLang
    },
    content: {
      panel,
      moduleOpen,
      explorerTarget,
      explorerSection,
      moduleBack
    },
    refs: {
      contentBox
    },
    commands: {
      navigate,
      closePanel,
      finishExplorer,
      interaction,
      setExplorerSection,
      selectSection
    },
    t,
    tx
  } = useShowroom();
  const Panel = CONTENT_PANELS[panel?.type];
  return <div ref={contentBox} onKeyDown={e => {
    if (e.key !== 'Tab') return;
    const nodes = [...contentBox.current.querySelectorAll('button,a[href],input,select,iframe,video')].filter(n => !n.disabled && n.getClientRects().length);
    if (e.shiftKey && document.activeElement === nodes[0]) {
      e.preventDefault();
      nodes.at(-1)?.focus();
    } else if (!e.shiftKey && document.activeElement === nodes.at(-1)) {
      e.preventDefault();
      nodes[0]?.focus();
    }
  }} className={'content-host ' + (panel ? 'visible' : '')} hidden={!panel} role={panel ? 'dialog' : undefined} aria-modal={panel ? 'true' : undefined} aria-label={t('展厅内容', 'Showroom content')}><header className="content-top"><button onClick={() => closePanel()}><ArrowLeft />{t('返回', 'Back')}</button>{moduleOpen ? <nav>{[['products', '产品', 'Products'], ['categories', '品类', 'Categories'], ['brands', '品牌', 'Brands']].map(([section, zh, en]) => <button className={explorerSection === section ? 'active' : ''} key={section} onClick={() => selectSection(section)}>{t(zh, en)}</button>)}</nav> : <span>{tx(scene.name)}</span>}<div><button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}>{lang === 'zh' ? 'EN' : '中文'}</button><button onClick={() => closePanel(true)} aria-label={t('关闭详情', 'Close details')}><X /></button></div></header>
   <ExplorerHost open={moduleOpen} target={explorerTarget} lang={lang} onLanguage={setLang} onClose={finishExplorer} onInteraction={interaction} onSection={setExplorerSection} backRequest={moduleBack} onScene={id => navigate(id)} />
   {Panel && <Panel />}
  </div>;
}
