import{_ as n,c as a,b as l,a as p,o,r as e}from"./app.2f312369.js";const r="/learn-wgpu-zh/assets/screenshot.104d7fbd.png",d=JSON.parse('{"title":"Basic Imgui Demo","description":"","frontmatter":{},"headers":[],"relativePath":"showcase/imgui-demo/index.md","lastUpdated":1672913739000}'),t={name:"showcase/imgui-demo/index.md"},c=p(`<h1 id="basic-imgui-demo" tabindex="-1">Basic Imgui Demo <a class="header-anchor" href="#basic-imgui-demo" aria-hidden="true">#</a></h1><div class="warning"><p>This example is currently broken. It got behind when I was migrating the tutorial to 0.8 as the imgui_wgpu crate was still on 0.7 at the time. I haven&#39;t updated it since. While fixing it wouldn&#39;t be too hard (feel free to send a PR), I&#39;m considering removing this example entirely.</p><p>This tutorial is focused on how to use wgpu (and by extension the WebGPU standard). I&#39;m looking to minimize the amount of wgpu-adjacent crates that I&#39;m using. They can get in the way of keeping this tutorial as current as possible, and often a crate I&#39;m using will have a different version of wgpu (or winit as is the case as of writing) preventing me from continuing with migration. Beyond dependency conflicts, I&#39;d like to cover some of the topics that some of the existing crates implement such as text and guis.</p><p>For the 0.10 migration, I&#39;ll keep this example in and keep the showcase code excluded.</p></div><p>This is not an in-depth guide on how to use Imgui. But here are some of the basics you&#39;ll need to get started. We&#39;ll need to import <a href="https://docs.rs/imgui" target="_blank" rel="noreferrer">imgui-rs</a>, <a href="https://docs.rs/imgui-wgpu" target="_blank" rel="noreferrer">imgui-wgpu</a>, and <a href="https://docs.rs/imgui-winit-support" target="_blank" rel="noreferrer">imgui-winit-support</a>.</p><div class="language-toml line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">toml</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#A6ACCD;">imgui </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">0.7</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">imgui-wgpu </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">0.14</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">imgui-winit-support </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">0.7</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><div class="note"><p>I&#39;ve excluded some dependencies for brevity. I&#39;m also using the <a href="https://github.com/sotrh/learn-wgpu/tree/master/code/showcase/framework" target="_blank" rel="noreferrer">framework crate</a> I&#39;ve created for showcases to simplify setup. If you see a <code>display</code> variable in code, it&#39;s from the <code>framework</code>. <code>Display</code> is where the <code>device</code>, <code>queue</code>, <code>swap_chain</code>, and other basic wgpu objects are stored.</p></div><p>We need to set up imgui and a <code>WinitPlatform</code> to get started. Do this after creating you&#39;re <code>winit::Window</code>.</p><div class="language-rust line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">mut</span><span style="color:#A6ACCD;"> imgui </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">imgui</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">Context</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">create</span><span style="color:#89DDFF;">();</span></span>
<span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">mut</span><span style="color:#A6ACCD;"> platform </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">imgui_winit_support</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">WinitPlatform</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">init</span><span style="color:#89DDFF;">(&amp;</span><span style="color:#C792EA;">mut</span><span style="color:#A6ACCD;"> imgui</span><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#A6ACCD;">platform</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">attach_window</span><span style="color:#89DDFF;">(</span></span>
<span class="line"><span style="color:#A6ACCD;">    imgui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">io_mut</span><span style="color:#89DDFF;">(),</span><span style="color:#A6ACCD;"> </span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">&amp;</span><span style="color:#A6ACCD;">display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">window</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">imgui_winit_support</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">HiDpiMode</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">Default</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#A6ACCD;">imgui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">set_ini_filename</span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">None</span><span style="color:#89DDFF;">);</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>Now we need to configure the default font. We&#39;ll be using the window&#39;s scale factor to keep things from being too big or small.</p><div class="language-rust line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> hidpi_factor </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">window</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">scale_factor</span><span style="color:#89DDFF;">();</span></span>
<span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> font_size </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#F78C6C;">13</span><span style="color:#89DDFF;">.</span><span style="color:#F78C6C;">0</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;"> hidpi_factor</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">as</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">f32</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">imgui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">io_mut</span><span style="color:#89DDFF;">().</span><span style="color:#A6ACCD;">font_global_scale </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F78C6C;">0</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;"> hidpi_factor</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">as</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">f32</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">imgui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">fonts</span><span style="color:#89DDFF;">().</span><span style="color:#82AAFF;">add_font</span><span style="color:#89DDFF;">(&amp;[</span><span style="color:#FFCB6B;">FontSource</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">DefaultFontData</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    config</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Some</span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">imgui</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">FontConfig</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">        oversample_h</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        pixel_snap_h</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">true,</span></span>
<span class="line"><span style="color:#A6ACCD;">        size_pixels</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> font_size</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">..</span><span style="color:#FFCB6B;">Default</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">default</span><span style="color:#89DDFF;">()</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">}),</span></span>
<span class="line"><span style="color:#89DDFF;">}]);</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>Then you need to create the renderer. We need to use the surface&#39;s <code>TextureFormat</code> in order for things to work properly.</p><div class="language-rust line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> renderer_config </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">RendererConfig</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    texture_format</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">config</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">format</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">..</span><span style="color:#FFCB6B;">Default</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">default</span><span style="color:#89DDFF;">()</span></span>
<span class="line"><span style="color:#89DDFF;">};</span></span>
<span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> renderer </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Renderer</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">new</span><span style="color:#89DDFF;">(&amp;</span><span style="color:#C792EA;">mut</span><span style="color:#A6ACCD;"> imgui</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#A6ACCD;">display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">device</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#A6ACCD;">display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">queue</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> renderer_config</span><span style="color:#89DDFF;">);</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>When we update the scene, we&#39;ll need to update imgui.</p><div class="language-rust line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#A6ACCD;">self</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">imgui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">io_mut</span><span style="color:#89DDFF;">().</span><span style="color:#82AAFF;">update_delta_time</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">dt</span><span style="color:#89DDFF;">);</span><span style="color:#676E95;font-style:italic;"> // dt: std::time::Duration</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>I&#39;m not an expert with imgui, so I&#39;ll let the code speak for itself.</p><div class="language-rust line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#676E95;font-style:italic;">// Build the UI</span></span>
<span class="line"><span style="color:#A6ACCD;">self</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">platform</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">prepare_frame</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">self</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">imgui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">io_mut</span><span style="color:#89DDFF;">(),</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#A6ACCD;">display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">window</span><span style="color:#89DDFF;">)</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">expect</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">Failed to prepare frame!</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> ui </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> self</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">imgui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">frame</span><span style="color:#89DDFF;">();</span></span>
<span class="line"><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> window </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">imgui</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">Window</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">new</span><span style="color:#89DDFF;">(</span><span style="color:#82AAFF;">im_str!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">Hello Imgui from WGPU!</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">));</span></span>
<span class="line"><span style="color:#A6ACCD;">    window</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">size</span><span style="color:#89DDFF;">([</span><span style="color:#F78C6C;">300</span><span style="color:#89DDFF;">.</span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">100</span><span style="color:#89DDFF;">.</span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">],</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Condition</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">FirstUseEver</span><span style="color:#89DDFF;">)</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">build</span><span style="color:#89DDFF;">(&amp;</span><span style="color:#A6ACCD;">ui</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">||</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">            ui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">text</span><span style="color:#89DDFF;">(</span><span style="color:#82AAFF;">im_str!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">Hello world!</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">));</span></span>
<span class="line"><span style="color:#A6ACCD;">            ui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">text</span><span style="color:#89DDFF;">(</span><span style="color:#82AAFF;">im_str!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">This is a demo of imgui-rs using imgui-wgpu!</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">));</span></span>
<span class="line"><span style="color:#A6ACCD;">            ui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">separator</span><span style="color:#89DDFF;">();</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> mouse_pos </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> ui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">io</span><span style="color:#89DDFF;">().</span><span style="color:#A6ACCD;">mouse_pos</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">            ui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">text</span><span style="color:#89DDFF;">(</span><span style="color:#82AAFF;">im_str!</span><span style="color:#89DDFF;">(</span></span>
<span class="line"><span style="color:#A6ACCD;">                </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">Mouse Position: (</span><span style="color:#89DDFF;">{</span><span style="color:#C3E88D;">:.1</span><span style="color:#89DDFF;">}</span><span style="color:#C3E88D;">, </span><span style="color:#89DDFF;">{</span><span style="color:#C3E88D;">:.1</span><span style="color:#89DDFF;">}</span><span style="color:#C3E88D;">)</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">                mouse_pos</span><span style="color:#89DDFF;">[</span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">                mouse_pos</span><span style="color:#89DDFF;">[</span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">));</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">});</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// Prepare to render</span></span>
<span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">mut</span><span style="color:#A6ACCD;"> encoder </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">device</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">create_command_encoder</span><span style="color:#89DDFF;">(&amp;</span><span style="color:#FFCB6B;">Default</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">default</span><span style="color:#89DDFF;">());</span></span>
<span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> output </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;font-style:italic;">match</span><span style="color:#A6ACCD;"> display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">swap_chain</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">get_current_texture</span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">Ok</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">frame</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> frame</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">Err</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">e</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#82AAFF;">eprintln!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">Error getting frame: </span><span style="color:#89DDFF;">{</span><span style="color:#C3E88D;">:?</span><span style="color:#89DDFF;">}&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> e</span><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;font-style:italic;">return</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">}.</span><span style="color:#A6ACCD;">output</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// Render the scene</span></span>
<span class="line"><span style="color:#A6ACCD;">self</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">canvas</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">render</span><span style="color:#89DDFF;">(</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">&amp;</span><span style="color:#A6ACCD;">display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">queue</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">&amp;</span><span style="color:#C792EA;">mut</span><span style="color:#A6ACCD;"> encoder</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">&amp;</span><span style="color:#A6ACCD;">output</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">view</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span></span>
<span class="line"><span style="color:#A6ACCD;">    display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">config</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">width </span><span style="color:#F78C6C;">as</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">f32</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span></span>
<span class="line"><span style="color:#A6ACCD;">    display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">config</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">height </span><span style="color:#F78C6C;">as</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">f32</span></span>
<span class="line"><span style="color:#89DDFF;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// Render the UI</span></span>
<span class="line"><span style="color:#89DDFF;font-style:italic;">if</span><span style="color:#A6ACCD;"> self</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">last_cursor </span><span style="color:#89DDFF;">!=</span><span style="color:#A6ACCD;"> ui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">mouse_cursor</span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    self</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">last_cursor </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> ui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">mouse_cursor</span><span style="color:#89DDFF;">();</span></span>
<span class="line"><span style="color:#A6ACCD;">    self</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">platform</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">prepare_render</span><span style="color:#89DDFF;">(&amp;</span><span style="color:#A6ACCD;">ui</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#A6ACCD;">display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">window</span><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">mut</span><span style="color:#A6ACCD;"> pass </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> encoder</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">begin_render_pass</span><span style="color:#89DDFF;">(&amp;</span><span style="color:#FFCB6B;">wgpu</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">RenderPassDescriptor</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    label</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Some</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">UI RenderPass</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">),</span></span>
<span class="line"><span style="color:#A6ACCD;">    color_attachments</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;[</span><span style="color:#FFCB6B;">wgpu</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">RenderPassColorAttachment</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">                    view</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#A6ACCD;">view</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        attachment</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#A6ACCD;">output</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">view</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        resolve_target</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">None</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        ops</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">wgpu</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">Operations</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">            load</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">wgpu</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">LoadOp</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">Load</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">            store</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">true,</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">}],</span></span>
<span class="line"><span style="color:#A6ACCD;">    depth_stencil_attachment</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">None</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#89DDFF;">});</span></span>
<span class="line"><span style="color:#A6ACCD;">self</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">renderer</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">render</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">ui</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">render</span><span style="color:#89DDFF;">(),</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#A6ACCD;">display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">queue</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#A6ACCD;">display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">device</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#C792EA;">mut</span><span style="color:#A6ACCD;"> pass</span><span style="color:#89DDFF;">)</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">expect</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">Failed to render UI!</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#82AAFF;">drop</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">pass</span><span style="color:#89DDFF;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">display</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">queue</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">submit</span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">Some</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">encoder</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">finish</span><span style="color:#89DDFF;">()));</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br></div></div><p>That&#39;s all there is to it. Here&#39;s a picture of the results!</p><p><img src="`+r+'" alt="./screenshot.png"></p>',17);function D(F,y,i,C,A,u){const s=e("AutoGithubLink");return o(),a("div",null,[c,l(s)])}const b=n(t,[["render",D]]);export{d as __pageData,b as default};