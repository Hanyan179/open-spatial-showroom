# 内容维护指南

先复制一份现有记录，保持必需字段和稳定 ID，再修改内容。所有随包记录都是示例；不要把示例材质、年份或合作关系当作实际事实。

## 1. 名称、可选标志、接口与外部网站

编辑 `public/showroom.config.json`。默认标志为 `null`，界面显示通用展厅标题。

```json
{
  "identity": {
    "title": {"zh": "我的互动展厅", "en": "My Interactive Showroom"},
    "welcome": {"zh": "欢迎探索", "en": "WELCOME"},
    "logoUrl": null
  },
  "content": {
    "companyUrl": "/data/company.json",
    "resourcesUrl": "/data/resources.json",
    "lifeUrl": "/data/company-life.json",
    "roomProductsUrl": "/data/room-products.json"
  },
  "requests": {"timeoutMs": 12000, "credentials": "same-origin"},
  "external": {
    "productHome": null,
    "productCategories": {"beauty": null, "play": null, "party": null}
  }
}
```

需要自己的标志时，将透明背景图片放到 `public/media/custom/`，填写如 `/media/custom/logo.png`。标志会在界面与三维标识挂点保持原比例。更改配置后刷新页面，避免当前会话缓存旧值。门牌与其他物理标识有独立的场景定义，名称变化时也要检查它们。

四个内容 URL 可改为返回同结构 JSON 的 HTTPS 接口。后端应配置跨域许可；媒体相对路径的基准见各节。应用不实现登录流程，`credentials` 仅控制 fetch 的凭证策略。不要把访问令牌写入配置。

外部产品网站填写完整 HTTPS URL，未配置时仍可浏览内置概念样品。网站本身必须能接受用户的正常访问权限；本项目不代为登录。

## 2. 公司介绍、历程与能力

`public/data/company.json` 使用 `{zh,en}` 文本对象：

| 字段 | 用途 |
| --- | --- |
| `name`、`headline`、`description` | 介绍页 |
| `history: [{year, summary}]` | 时间线内容和大厅年份雕塑 |
| `capabilities: [{id,title,description}]` | 能力概览 |
| `culture: [{title,description}]` | 文化内容 |
| `company_groups`、`brands`、`cases`、`honors` | 可选组织、品牌、案例、荣誉；默认空 |

扩展可选资料前参考 `CompanyContent.jsx` 的字段读取方式；当前界面不会自动为任意业务字段生成表单。展示真正资料时根据事实调整文字并取消对应的示例说明。

**年份雕塑由构建时的本地 `history` 生成。** 修改年份、数量或合作展示挂点后运行 `npm run build:scenes`。目前大厅适合约六个里程碑；大量记录应在详情页展示，不要无限增加雕塑导致重叠。仅替换远程接口不会自动重排三维结构。

## 3. 给现有分类增加一个图片产品

把图片放到 `public/media/custom/`，向 `public/data/room-products.json` 的 `products` 添加：

```json
{
  "id": "my-bath-sample",
  "domain": "beauty",
  "point": "serum",
  "category": "Bath Bomb",
  "title": {"zh": "沐浴示例", "en": "Bath example"},
  "sku": "EXAMPLE-019",
  "brand": null,
  "sourceName": "",
  "sourceUrl": null,
  "image": "/media/custom/bath-example.png",
  "imageKind": {"zh": "示例图片", "en": "Example image"},
  "modelKind": "image-only",
  "description": {"zh": "这里填写说明。", "en": "Describe the item here."},
  "sceneNote": {"zh": "示例内容。", "en": "Example content."},
  "concept": true
}
```

这条记录会进入美妆房的“沐浴护理”分类，无需再建一个展位或模型。`category` 必须匹配 `core/product-categories.js` 中的 `sourceCategories`，不能仅凭产品名称推断。

| 领域 ID | 示例分类 | 参观点 |
| --- | --- | --- |
| `beauty` | `Lip Repair` / `Bath Bomb` / `Nail Sticker` / `Cosmetic Brushes` / `Sponges - Cosmetic` | `lipstick` / `serum` / `compact` / `brushes` / `sponges` |
| `play` | `Card&Board Games` / `Toy Kit` / `Indoor & Outdoor Play` / `Puzzles` / `STEM Kit` | `rings` / `maraca` / `puzzle` / `puzzles` / `science` |
| `party` | `Balloons` / `Party Decor/Favors` / `Candle - Party` / `Paper Tableware` / `Paper Napkins` | `balloon` / `gift` / `collection` / `tableware` / `napkins` |

`id` 全局唯一；`domain`、`point` 必须存在。现有主展品 ID 被物理挂点引用，替换它的图片很方便；删除它需同步调整场景动作和模型挂点，架构检查会报告悬空引用。

`sourceUrl` 可空；有来源时仅使用有效 HTTP/HTTPS 地址。远程产品接口中的相对图片 URL 相对该接口地址解析。`modelKind` 是陈列说明，不会自动加载任意 GLB。

## 4. 模型、款式、多图与视频探索器

可编辑源文件位于 `vendor/explorer/public/`，更改后运行 `npm run build:explorer`，不要直接编辑 `public/modules/product-explorer/`。

| 文件 | 用途 |
| --- | --- |
| `shared/catalog.json` | 品牌档案、大类与细分类；默认 0 个品牌、3 大类、8 个细分类 |
| `shared/official-content.json` | 可选精选品牌；默认 `{"brands":[]}`，文件名不表示官方认证 |
| `shared/domains.json` | 领域与大类关系 |
| `shared/concepts.json` | 产品身份、描述、领域、细分类、可选 `brandId` |
| `shared/explorer-media.json` | 以产品 ID 为键的模型、图片和视频配置 |
| `shared/product-skus.json` | 款式，含 `productId`、颜色、材质和独立媒体 |

房间产品目录和概念模型目录是两个用途不同的数据集合：前者以真实业务中的图片列表维护方式为例，后者演示模型与款式。它们共享宿主但不会根据同名字段自动建立商品关系。需要贯通时在场景动作里明确选择打开哪个入口，勿默认为同一产品。

示例媒体结构：

```json
{
  "model": "lipstick",
  "default": "photos",
  "images": [
    {"src": "custom/front.png", "label": ["正面", "Front"]},
    {"src": "custom/detail.png", "label": ["细节", "Detail"]}
  ],
  "video": "custom/demo.mp4"
}
```

视频封面使用第一张图片。`video` 填字符串路径，照片墙和电视则使用另一节的媒体对象格式。媒体路径相对探索器自身根路径，文件放入 `vendor/explorer/public/custom/`。无模型时移除 `model`；无视频时移除 `video`，界面只显示可用媒体标签。随包三张示意图是原创插画变体，并非真实多角度产品摄影；默认没有视频。

`model` 是现有程序化模型 ID，不是 GLB 文件路径。添加外部 GLB 模型需要扩展探索器加载器、资源释放和交互逻辑。字段变化后检查产品、款式、媒体和返回状态。

可选品牌记录支持 `id`、`name`、`logo`、`descriptor`、`description`、`pillars`、`archiveName`。文本可用 `{zh,en}`；`pillars` 是文本对象列表。`archiveName` 用于显式关联档案名称，不填则不关联。不要根据名字相似自动归属品牌。

## 5. 新闻、合作展示与外部页面

编辑 `public/data/resources.json`。

```json
{
  "news": [{
    "id": "story-1",
    "date": "2026-01-01",
    "title": {"zh": "示例文章", "en": "Example story"},
    "summary": {"zh": "文章摘要。", "en": "Story summary."},
    "url": "https://example.org/",
    "embed": false
  }],
  "partners": [{
    "id": "partner-1",
    "name": {"zh": "合作示例", "en": "Example partner"},
    "description": {"zh": "占位说明。", "en": "Placeholder."},
    "legalName": "",
    "logo": null
  }]
}
```

`embed:true` 才尝试内嵌阅读；目标网站可能通过 CSP 或 X-Frame-Options 禁止嵌入，仍提供单独打开入口。仅嵌入可信内容；不要用该功能运行未经审查的同源脚本。

新闻的 `image`、`url` 使用完整 URL 或展厅根路径。合作标志的相对路径以资料接口地址为基准，3D 挂点按 `id` 匹配。默认三个合作示例不是实际客户；修改实体名称或挂点后重建模型。

## 6. 照片墙和电视

`public/data/company-life.json` 的 `photos`、`videos` 默认空数组。添加记录格式：

```json
{
  "photos": [{
    "id": "photo-1", "src": "/media/custom/photo.jpg",
    "title": {"zh": "活动照片", "en": "Event photograph"},
    "caption": {"zh": "这里填写说明。", "en": "Add a caption."},
    "credit": {"zh": "摄影授权说明", "en": "Photo credit"}
  }],
  "videos": [{
    "id": "film-1", "src": "/media/custom/film.mp4",
    "poster": "/media/custom/poster.jpg",
    "title": {"zh": "示例影片", "en": "Example film"}
  }]
}
```

ID 在两种媒体中都不能重复，相对媒体路径以接口 URL 为基准。浏览器自动播放受策略约束，默认静音；用户可通过视频控件播放。推荐提供兼容浏览器的编码和小体积封面，部署到自己的资源服务器前确认授权。

## 发布前

配置和媒体修改后，重建受影响的生成物并运行 `npm run build`、`npm test`、`npm run check:public`。测试中的默认示例数量断言在你有意更换示例集时也要更新，但不能删掉引用与操作验证来掩盖问题。

公开检查可发现常见敏感文件、凭证形态、个人路径和缺失媒体，不能判断商标授权、肖像许可或所有商业机密。最后人工审阅将要提交的文件。私密内容应放到受权限保护的服务，不应进入公共仓库及其提交历史。
