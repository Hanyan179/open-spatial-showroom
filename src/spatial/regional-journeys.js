// Regional roles come from the project brief. These are illustrative walkthroughs,
// not claims about particular facilities, equipment, process standards or results.
export const REGION_JOURNEYS = {
  cambodia: {
    order: 3,
    name: ['柬埔寨 · 制造与供应链', 'Cambodia · Making & supply chain'],
    tag: ['从一道工序，到一次交付', 'FROM PROCESS TO DELIVERY'],
    accent: 'teal',
    steps: [{
      id: 'production',
      name: ['加工与制造', 'Production & making'],
      label: ['01 / MAKING', '加工制造'],
      sides: [['材料准备与加工产线', 'Materials & production'], ['工装与工序协作', 'Tooling & process planning']],
      description: ['从左侧的材料与加工装置，看到右侧的工装、装配和工序衔接。', 'Explore material preparation and the production line, then tooling, assembly and process coordination.'],
      flow: [['材料准备', 'Material preparation'], ['加工成形', 'Processing'], ['装配衔接', 'Assembly handoff']],
      deliverable: ['把材料、样品与工序要求联系起来，再进入检查环节。', 'Connect materials, samples and process requirements before inspection.']
    }, {
      id: 'quality',
      name: ['质量与检查', 'Quality & inspection'],
      label: ['02 / INSPECTION', '质量检查'],
      sides: [['样品检查与测量', 'Sample inspection & measurement'], ['对照留样与记录', 'Reference samples & records']],
      description: ['在检查台观察外观与尺寸，再到另一侧了解留样、对照与问题记录。', 'Examine appearance and dimensions, then reference samples, comparisons and issue records.'],
      flow: [['样品对照', 'Sample comparison'], ['外观与尺寸', 'Appearance & dimensions'], ['记录与反馈', 'Records & feedback']],
      deliverable: ['让检查对象、发现的问题与后续处理保持可追溯的联系。', 'Keep samples, observations and follow-up actions connected.']
    }, {
      id: 'delivery',
      dwellMs: 25000,
      name: ['供应链与交付', 'Supply chain & delivery'],
      label: ['03 / DELIVERY', '供应链交付'],
      sides: [['包装与集货', 'Packing & consolidation'], ['仓储与交付协作', 'Storage & dispatch planning']],
      description: ['从包装台与托盘走向仓储货架，理解包装、集货和交付信息如何衔接。', 'Follow packing benches and pallets into storage, connecting packaging, consolidation and delivery information.'],
      flow: [['包装整理', 'Packing'], ['仓储集货', 'Storage & consolidation'], ['交付协作', 'Dispatch coordination']],
      deliverable: ['以产品、包装与交付要求作为各方协作的共同依据。', 'Coordinate around the product, packaging and delivery requirements.']
    }]
  },
  china: {
    order: 1,
    name: ['中国 · 创意与研发', 'China · Creative origin'],
    tag: ['从一条线索，到一个样品', 'FROM INSIGHT TO SAMPLE'],
    accent: 'sage',
    steps: [{
      id: 'ideas',
      name: ['创意与设计', 'Ideas & design'],
      label: ['01 / IDEAS', '创意设计'],
      sides: [['灵感资料与方案推演', 'Inspiration & concepts'], ['产品设计工作台', 'Product design studio']],
      description: ['从色彩、情绪与品类线索开始，沿设计板和工作台看到方案逐渐清晰。', 'Follow colour, mood and category references through concept boards and design workstations.'],
      flow: [['收集线索', 'Gather references'], ['比较方向', 'Compare directions'], ['形成方案', 'Develop concepts']],
      deliverable: ['形成可讨论的设计方向，为材料研究与研发提供上下文。', 'Create a shared design direction for material research and development.']
    }, {
      id: 'research',
      name: ['材料与研究', 'Materials & research'],
      label: ['02 / MATERIALS', '材料研究'],
      sides: [['色彩与表面材料库', 'Colour & finish library'], ['研究与比较工作台', 'Research & comparison bench']],
      description: ['把色彩、织物、表面与样品放在一起比较，让研究能够回应产品表达。', 'Compare colour, textiles, finishes and samples to inform product expression.'],
      flow: [['材料选择', 'Material selection'], ['并置比较', 'Side-by-side comparison'], ['研究反馈', 'Research feedback']],
      deliverable: ['把材料与表面选择交给样品验证，保留比较依据。', 'Carry material and finish choices into sample development with their context.']
    }, {
      id: 'samples',
      name: ['研发与样品', 'Development & samples'],
      label: ['03 / DEVELOPMENT', '研发样品'],
      sides: [['模型与打样工坊', 'Model & prototype workshop'], ['样品比较与开发讨论', 'Sample review & development']],
      description: ['走近模型工坊，再从另一侧查看不同样品与开发信息如何一起被讨论。', 'Explore model making, then compare sample iterations and development information.'],
      flow: [['模型打样', 'Prototype'], ['样品比较', 'Compare samples'], ['开发衔接', 'Development handoff']],
      deliverable: ['以可观察的实物和清晰的信息连接后续制造。', 'Connect tangible samples and clear development information with manufacturing.']
    }]
  },
  usa: {
    order: 2,
    name: ['美国 · 市场与团队', 'United States · Markets & team'],
    tag: ['从产品提案，到共同推进', 'FROM PROPOSAL TO COLLABORATION'],
    accent: 'blue',
    steps: [{
      id: 'market',
      name: ['市场与产品提案', 'Markets & proposals'],
      label: ['01 / MARKET', '市场提案'],
      sides: [['产品与渠道陈列', 'Products & channel display'], ['提案比较与市场反馈', 'Proposal review & feedback']],
      description: ['从渠道陈列看产品的呈现，再在提案台比较组合与表达方式。', 'Explore product presentation in a channel setting, then compare proposals and assortments.'],
      flow: [['理解场景', 'Understand context'], ['组织提案', 'Build proposals'], ['收集反馈', 'Gather feedback']],
      deliverable: ['将产品选择和市场反馈带入具体的客户讨论。', 'Bring product selections and market feedback into customer conversations.']
    }, {
      id: 'customers',
      name: ['客户与合作', 'Customers & collaboration'],
      label: ['02 / COLLABORATION', '客户协作'],
      sides: [['客户会谈与样品讨论', 'Customer conversations'], ['需求整理与共创', 'Requirements & co-creation']],
      description: ['会客空间与共创墙围绕样品展开，连接客户需求、方案和待确认事项。', 'Connect customer requirements, proposals and open questions through sample discussions.'],
      flow: [['讨论需求', 'Discuss needs'], ['比较样品', 'Review samples'], ['确认下一步', 'Agree next steps']],
      deliverable: ['让各方对需求和下一步工作形成清晰、可核对的理解。', 'Create a shared, reviewable understanding of requirements and next steps.']
    }, {
      id: 'team',
      name: ['美国团队', 'Our US team'],
      label: ['03 / CONNECTIONS', '团队连接'],
      sides: [['当地沟通与项目工作台', 'Local project workspace'], ['跨地区协作', 'Cross-region collaboration']],
      description: ['在当地保持客户沟通，并把产品、创研与制造信息连接起来。', 'Maintain local customer communication while connecting product, design and manufacturing information.'],
      flow: [['当地沟通', 'Local conversations'], ['跨区协作', 'Cross-region work'], ['持续反馈', 'Ongoing feedback']],
      deliverable: ['让市场需求能够持续回到创研、制造和产品讨论。', 'Keep market needs connected with creative work, manufacturing and product discussions.']
    }]
  }
};
export const isRegional = id => Boolean(REGION_JOURNEYS[id]);
export const STATION_Z = [2, -10, -22];
export function journeyIndex(scene, point) {
  return REGION_JOURNEYS[scene]?.steps.findIndex(s => point === s.id || point === s.id + '-opposite') ?? -1;
}
export function regionSpec(id) {
  const j = REGION_JOURNEYS[id];
  return {
    floor: 'global',
    name: j.name,
    tag: j.tag,
    summary: [j.steps.map(s => s.name[0]).join(' → '), j.steps.map(s => s.name[1]).join(' → ')],
    tone: 'light',
    resource: id,
    journey: true,
    overview: {
      position: [0, 1.95, 10.2],
      look: [0, 1.9, -24]
    },
    points: j.steps.map((s, i) => ({
      id: s.id,
      ...(s.dwellMs?{dwellMs:s.dwellMs}:{}),
      name: s.name,
      anchor: [-2.65, 1.5, STATION_Z[i] + .8],
      camera: {
        position: [0, 1.85, STATION_Z[i] + 3.4],
        look: [-5.1, 1.45, STATION_Z[i] - .25]
      },
      action: {
        type: 'region',
        id,
        chapter: i
      }
    })),
    extraViews: Object.fromEntries(j.steps.map((s, i) => [s.id + '-opposite', {
      position: [0, 1.85, STATION_Z[i] + 3.4],
      look: [5.1, 1.45, STATION_Z[i] - .25 - (i === 1 ? 3.3 : 0)]
    }]))
  };
}
