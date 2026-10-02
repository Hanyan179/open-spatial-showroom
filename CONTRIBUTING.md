# Contributing

问题反馈请提供浏览器、视口尺寸、画质档位、操作步骤、预期与实际结果。截图应去除客户和个人信息。请说明问题发生在自动巡游、用户接管、产品详情还是返回途中。

开发前阅读 [AGENTS.md](AGENTS.md)。建议先聚焦一个可复现问题或一个完整体验，再扩大场景。提交时解释行为变化、验证范围及仍未确认的设备条件。

```bash
npm ci
npm run build:all
npm test
npm run check:public
```

模型和产品模块的生成物随仓库维护，源文件改动后请一并重建。不要手改生成文件。每次提交新媒体需提供来源及再分发许可；真实品牌、产品关联和授权关系由贡献者证明。

请勿在公开问题中上传访问令牌、私有接口、源档案或个人资料。疑似敏感信息泄露时先从自己的部署中撤下相关内容，再通过 GitHub 的私密安全报告渠道联系维护者（如果仓库已启用）。

Contributions are welcome. Keep changes focused, explain the user-visible outcome, and include relevant checks. By contributing original work, you agree to distribute it under this repository's MIT license. Third-party assets retain their own licenses and require explicit provenance.

## 提交前的文档与报告

参与讨论和评审时遵守 [社区行为准则](CODE_OF_CONDUCT.md)。普通缺陷与功能建议可使用 [缺陷模板](.github/ISSUE_TEMPLATE/bug_report.md) 或 [功能建议模板](.github/ISSUE_TEMPLATE/feature_request.md)；合并请求请填写 [PR 模板](.github/pull_request_template.md)。安全问题按 [SECURITY.md](SECURITY.md) 处理，不要填写公开缺陷模板。

请区分「实际运行通过」「检查失败」「未运行」。仅修改文档时至少检查相对链接、命令是否与 `package.json` 一致，以及 diff 是否仅包含预期文件；这类静态检查不能称为构建、测试或设备验收通过。当前审阅基线与未核验项目见 [维护范围](docs/MAINTENANCE.md)。
