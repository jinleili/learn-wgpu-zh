import { defineConfig } from "vitepress";

export default defineConfig({
  // https://vitepress.dev/reference/site-config
  lang: "zh-CN",
  title: "学习 wgpu",
  description: "wgpu：下一代跨平台图形接口 WebGPU 的 Rust 实现",
  base: "/learn-wgpu-zh/",

  server: {
    host: "0.0.0.0",
    port: 80,
    hmr: false,
  },

  appearance: true,
  lastUpdated: true,

  cleanUrls: "without-subfolders",

  head: [["link", { rel: "icon", href: "/learn-wgpu-zh/favicon.svg" }]],

  markdown: {
    lineNumbers: true,
    headers: {
      // 这个配置目前的版本 (alpha-21) 不能改
      // 修改后，右边栏将只会在 dev 模式下显示
      level: [0, 0],
    },
  },

  locales: {
    root: { label: "中文" },
    en: { label: "English", link: "https://sotrh.github.io/learn-wgpu/" },
  },

  themeConfig: {
    logo: "/res/wgpu-logo.png",
    lastUpdated: true,
    lastUpdatedText: "上次更新",
    docFooter: {
      prev: "上一章",
      next: "下一章",
    },
    outlineTitle: "本章内容",

    socialLinks: [
      { icon: "github", link: "https://github.com/jinleili/learn-wgpu-zh" },
    ],
    nav: [
      { text: "Simuverse", link: "/simuverse" },
      { text: "wgpu-in-app", link: "https://github.com/jinleili/wgpu-in-app" },
      { text: "bevy-in-app", link: "https://github.com/jinleili/bevy-in-app" },
    ],
    sidebar: {
      "/": sidebarConfig(),
    },

    // algolia: {
    //     appId: "Q0PA0L042P",
    //     apiKey: "67756efd9c1a012a2c2f5edd0d26222b",
    //     indexName: "learn_wgpu_zh",
    // },
    // algolia: {
    //     appId: "141Z7KL53C",
    //     apiKey: "4ec796e7f2bdbe7eb00e28d355b91f06",
    //     indexName: "learn-gpu-zh",
    // },
  },
});

function sidebarConfig() {
  return [
    {
      text: "基础",
      collapsible: true,
      items: [
        { text: "依赖与窗口", link: "/beginner/tutorial1-window" },
        {
          text: "展示平面 (Surface)",
          link: "/beginner/tutorial2-surface/",
        },
        {
          text: "管线 (Pipeline)",
          link: "/beginner/tutorial3-pipeline/",
        },
        {
          text: "缓冲区与索引",
          link: "/beginner/tutorial4-buffer/",
        },
        {
          text: "纹理和绑定组",
          link: "/beginner/tutorial5-textures/",
        },
        {
          text: "Uniform 缓冲区与 3D 虚拟摄像机",
          link: "/beginner/tutorial6-uniforms/",
        },
        {
          text: "实例化绘制",
          link: "/beginner/tutorial7-instancing/",
        },
        {
          text: "深度缓冲区",
          link: "/beginner/tutorial8-depth/",
        },
        { text: "模型加载", link: "/beginner/tutorial9-models/" },
        { text: "🆕 WGSL 着色器语言", link: "/beginner/wgsl" },
      ],
    },
    {
      text: "进阶",
      collapsible: true,
      items: [
        {
          text: "光照",
          link: "/intermediate/tutorial10-lighting/",
        },
        {
          text: "法线映射",
          link: "/intermediate/tutorial11-normals/",
        },
        { text: "更好的摄像机", link: "/intermediate/tutorial12-camera/" },
        { text: "🆕 计算管线", link: "/intermediate/compute-pipeline/" },
        { text: "🆕 顶点动画", link: "/intermediate/vertex-animation/" },
        {
          text: "🆕 万能动画公式",
          link: "/intermediate/vertex-animation/universal-animation-formula.md",
        },
        {
          text: "渲染 HDR 场景",
          link: "/intermediate/hdr/",
        },
        {
          text: "🆕 实现 iOS iMessage 中的隐形墨水特效",
          link: "/intermediate/invisible-ink/",
        },
      ],
    },
    {
      text: "集成与调试",
      collapsible: true,
      items: [
        {
          text: "楔子",
          link: "/integration-and-debugging/",
        },
        {
          text: "🆕 与 iOS App 集成",
          link: "/integration-and-debugging/ios/",
        },
        {
          text: "🆕 与 Android App 集成",
          link: "/integration-and-debugging/android/",
        },
        {
          text: "🆕 使用 Xcode 调试 wgpu 程序",
          link: "/integration-and-debugging/xcode/",
        },
        {
          text: "🆕 使用 Snapdragon Profiler 调试",
          link: "/integration-and-debugging/snapdragon-profiler/",
        },
        {
          text: "🆕 在 iOS Android App 中集成 Bevy 游戏引擎",
          link: "/integration-and-debugging/bevy/",
        }, 
        {
          text: "🆕 在 wgpu 项目中集成 bevy_ecs",
          link: "/integration-and-debugging/bevy/ecs.md",
        },
      ],
    },
    {
      text: "案例展示",
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: "离屏渲染",
          link: "/showcase/windowless/",
        },
        {
          text: "生成 GIF 动图",
          link: "/showcase/gifs/",
        },
        {
          text: "Pong",
          link: "/showcase/pong/",
        },
        {
          text: "Compute Example: Tangents and Bitangents",
          link: "/showcase/compute/",
        },
      ],
    },
    {
      text: "附录",
      items: [
        { text: "介绍", link: "/index" },
        { text: "术语中英对照表", link: "/GLOSSARY_OF_TERMS" },
      ],
    },
  ];
}
