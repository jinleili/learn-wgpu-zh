import{_ as n,c as a,b as l,a as p,o,r as e}from"./app.5a50a029.js";const b=JSON.parse('{"title":"Multi-threading with Wgpu and Rayon","description":"","frontmatter":{},"headers":[],"relativePath":"showcase/threading.md","lastUpdated":1672190638000}'),t={name:"showcase/threading.md"},r=p(`<h1 id="multi-threading-with-wgpu-and-rayon" tabindex="-1">Multi-threading with Wgpu and Rayon <a class="header-anchor" href="#multi-threading-with-wgpu-and-rayon" aria-hidden="true">#</a></h1><div class="warn"><p>This example has not been tested on WASM. Rayon has support for multi threading on WASM via <a href="https://docs.rs/crate/wasm-bindgen-rayon/latest" target="_blank" rel="noreferrer">wasm-bindgen-rayon</a>, though that implementation is only currently working on Chrome-based browsers. Because of this I&#39;ve elected not to make a WASM version of this tutorial at this time.</p></div><p>The main selling point of Vulkan, DirectX 12, Metal, and by extension Wgpu is that these APIs is that they designed from the ground up to be thread safe. Up to this point, we have been doing everything on a single thread. That&#39;s about to change.</p><div class="note"><p>This example is based on the code for <a href="./../intermediate/tutorial12-camera/">tutorial12-camera</a></p></div><div class="note"><p>I won&#39;t go into what threads are in this tutorial. That is a full CS course in and of itself. All we&#39;ll be covering is using threading to make loading resources faster.</p><p>We won&#39;t go over multithreading rendering as we don&#39;t have enough different types of objects to justify that yet. This will change in a coming tutorial</p></div><h2 id="parallelizing-loading-models-and-textures" tabindex="-1">Parallelizing loading models and textures <a class="header-anchor" href="#parallelizing-loading-models-and-textures" aria-hidden="true">#</a></h2><p>Currently, we load the materials and meshes of our model one at a time. This is a perfect opportunity for multithreading! All our changes will be in <code>model.rs</code>. Let&#39;s first start with the materials. We&#39;ll convert the regular for loop into a <code>par_iter().map()</code>.</p><div class="language-rust line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki material-palenight has-diff"><code><span class="line"><span style="color:#676E95;font-style:italic;">// resources.rs</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">#[</span><span style="color:#A6ACCD;">cfg</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">not</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">target_arch</span><span style="color:#89DDFF;">=</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">wasm32</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">))]</span></span>
<span class="line"><span style="color:#F78C6C;">use</span><span style="color:#FFCB6B;"> rayon</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">iter</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">IntoParallelIterator</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">impl</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Model</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F78C6C;">pub</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">fn</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">load</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">P</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">AsRef</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">Path</span><span style="color:#89DDFF;">&gt;&gt;(</span></span>
<span class="line"><span style="color:#A6ACCD;">        device</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#FFCB6B;">wgpu</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">Device</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        queue</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#FFCB6B;">wgpu</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">Queue</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        layout</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#FFCB6B;">wgpu</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">BindGroupLayout</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        path</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">P</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">-&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Result</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">Self</span><span style="color:#89DDFF;">&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">        // ...</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">        // UPDATED!</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> materials </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> obj_materials</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">par_iter</span><span style="color:#89DDFF;">().</span><span style="color:#82AAFF;">map</span><span style="color:#89DDFF;">(|</span><span style="color:#A6ACCD;">mat</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">            // We can also parallelize loading the textures!</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">mut</span><span style="color:#A6ACCD;"> textures </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span></span>
<span class="line"><span style="color:#A6ACCD;">                </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">containing_folder</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">join</span><span style="color:#89DDFF;">(&amp;</span><span style="color:#A6ACCD;">mat</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">diffuse_texture</span><span style="color:#89DDFF;">),</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">false),</span></span>
<span class="line"><span style="color:#A6ACCD;">                </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">containing_folder</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">join</span><span style="color:#89DDFF;">(&amp;</span><span style="color:#A6ACCD;">mat</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">normal_texture</span><span style="color:#89DDFF;">),</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">true),</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">].</span><span style="color:#82AAFF;">par_iter</span><span style="color:#89DDFF;">().</span><span style="color:#82AAFF;">map</span><span style="color:#89DDFF;">(|(</span><span style="color:#A6ACCD;">texture_path</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> is_normal_map</span><span style="color:#89DDFF;">)|</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">                </span><span style="color:#FFCB6B;">texture</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">Texture</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">load</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">device</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> queue</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> texture_path</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;">is_normal_map</span><span style="color:#89DDFF;">)</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">}).</span><span style="color:#82AAFF;">collect</span><span style="color:#89DDFF;">::&lt;</span><span style="color:#FFCB6B;">Result</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">Vec</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">_</span><span style="color:#89DDFF;">&gt;&gt;&gt;()?;</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">            // Pop removes from the end of the list.</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> normal_texture </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> textures</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">pop</span><span style="color:#89DDFF;">().</span><span style="color:#82AAFF;">unwrap</span><span style="color:#89DDFF;">();</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> diffuse_texture </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> textures</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">pop</span><span style="color:#89DDFF;">().</span><span style="color:#82AAFF;">unwrap</span><span style="color:#89DDFF;">();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#FFCB6B;">Ok</span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">Material</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">new</span><span style="color:#89DDFF;">(</span></span>
<span class="line"><span style="color:#A6ACCD;">                device</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">                </span><span style="color:#89DDFF;">&amp;</span><span style="color:#A6ACCD;">mat</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">name</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">                diffuse_texture</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">                normal_texture</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">                layout</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">))</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">}).</span><span style="color:#82AAFF;">collect</span><span style="color:#89DDFF;">::&lt;</span><span style="color:#FFCB6B;">Result</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">Vec</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">Material</span><span style="color:#89DDFF;">&gt;&gt;&gt;()?;</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">        // ...</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">    // ...</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br></div></div><p>Next, we can update the meshes to be loaded in parallel.</p><div class="language-rust line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#F78C6C;">impl</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Model</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F78C6C;">pub</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">fn</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">load</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">P</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">AsRef</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">Path</span><span style="color:#89DDFF;">&gt;&gt;(</span></span>
<span class="line"><span style="color:#A6ACCD;">        device</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#FFCB6B;">wgpu</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">Device</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        queue</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#FFCB6B;">wgpu</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">Queue</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        layout</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#FFCB6B;">wgpu</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">BindGroupLayout</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        path</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">P</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">-&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Result</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">Self</span><span style="color:#89DDFF;">&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">        // ...</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">        // UPDATED!</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> meshes </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> obj_models</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">par_iter</span><span style="color:#89DDFF;">().</span><span style="color:#82AAFF;">map</span><span style="color:#89DDFF;">(|</span><span style="color:#A6ACCD;">m</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">mut</span><span style="color:#A6ACCD;"> vertices </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">..</span><span style="color:#A6ACCD;">m</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">mesh</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">positions</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">len</span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#89DDFF;">).</span><span style="color:#82AAFF;">into_par_iter</span><span style="color:#89DDFF;">().</span><span style="color:#82AAFF;">map</span><span style="color:#89DDFF;">(|</span><span style="color:#A6ACCD;">i</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">                </span><span style="color:#FFCB6B;">ModelVertex</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">                    position</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span></span>
<span class="line"><span style="color:#A6ACCD;">                        m</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">mesh</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">positions</span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">i </span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">                        m</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">mesh</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">positions</span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">i </span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">+</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">                        m</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">mesh</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">positions</span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">i </span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">+</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">2</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">                    </span><span style="color:#89DDFF;">].</span><span style="color:#82AAFF;">into</span><span style="color:#89DDFF;">(),</span></span>
<span class="line"><span style="color:#A6ACCD;">                    tex_coords</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span></span>
<span class="line"><span style="color:#A6ACCD;">                        m</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">mesh</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">texcoords</span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">i </span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">2</span><span style="color:#89DDFF;">],</span><span style="color:#A6ACCD;"> </span></span>
<span class="line"><span style="color:#A6ACCD;">                        m</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">mesh</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">texcoords</span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">i </span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">2</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">+</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#A6ACCD;">                    </span><span style="color:#89DDFF;">].</span><span style="color:#82AAFF;">into</span><span style="color:#89DDFF;">(),</span></span>
<span class="line"><span style="color:#A6ACCD;">                    normal</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span></span>
<span class="line"><span style="color:#A6ACCD;">                        m</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">mesh</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">normals</span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">i </span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">                        m</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">mesh</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">normals</span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">i </span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">+</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">                        m</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">mesh</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">normals</span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">i </span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">+</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">2</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">                    </span><span style="color:#89DDFF;">].</span><span style="color:#82AAFF;">into</span><span style="color:#89DDFF;">(),</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">                    // We&#39;ll calculate these later</span></span>
<span class="line"><span style="color:#A6ACCD;">                    tangent</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">.</span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#89DDFF;">].</span><span style="color:#82AAFF;">into</span><span style="color:#89DDFF;">(),</span></span>
<span class="line"><span style="color:#A6ACCD;">                    bitangent</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">.</span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#89DDFF;">].</span><span style="color:#82AAFF;">into</span><span style="color:#89DDFF;">(),</span></span>
<span class="line"><span style="color:#A6ACCD;">                </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">}).</span><span style="color:#82AAFF;">collect</span><span style="color:#89DDFF;">::&lt;</span><span style="color:#FFCB6B;">Vec</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">_</span><span style="color:#89DDFF;">&gt;&gt;();</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">            // ...</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> index_buffer </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> device</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">create_buffer_init</span><span style="color:#89DDFF;">(</span></span>
<span class="line"><span style="color:#A6ACCD;">                </span><span style="color:#89DDFF;">&amp;</span><span style="color:#FFCB6B;">wgpu</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">util</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">BufferInitDescriptor</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">                    label</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Some</span><span style="color:#89DDFF;">(&amp;</span><span style="color:#82AAFF;">format!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;{</span><span style="color:#C3E88D;">:?</span><span style="color:#89DDFF;">}</span><span style="color:#C3E88D;"> Index Buffer</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> m</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">name</span><span style="color:#89DDFF;">)),</span><span style="color:#676E95;font-style:italic;"> // UPDATED!</span></span>
<span class="line"><span style="color:#A6ACCD;">                    contents</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">bytemuck</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">cast_slice</span><span style="color:#89DDFF;">(&amp;</span><span style="color:#A6ACCD;">m</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">mesh</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">indices</span><span style="color:#89DDFF;">),</span></span>
<span class="line"><span style="color:#A6ACCD;">                    usage</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">wgpu</span><span style="color:#89DDFF;">::</span><span style="color:#FFCB6B;">BufferUsages</span><span style="color:#89DDFF;">::</span><span style="color:#A6ACCD;">INDEX</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">                </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">);</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">            // ...</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">            // UPDATED!</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#FFCB6B;">Ok</span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">Mesh</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">                // ...</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">})</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">}).</span><span style="color:#82AAFF;">collect</span><span style="color:#89DDFF;">::&lt;</span><span style="color:#FFCB6B;">Result</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">Vec</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">_</span><span style="color:#89DDFF;">&gt;&gt;&gt;()?;</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">        // ...</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">    // ...</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br></div></div><p>We&#39;ve parallelized loading the meshes, and making the vertex array for them. Probably a bit overkill, but <code>rayon</code> should prevent us from using too many threads.</p><div class="note"><p>You&#39;ll notice that we didn&#39;t use <code>rayon</code> for calculating the tangent, and bitangent. I tried to get it to work, but I was having trouble finding a way to do it without multiple mutable references to <code>vertices</code>. I don&#39;t feel like introducing a <code>std::sync::Mutex</code>, so I&#39;ll leave it for now.</p><p>This is honestly a better job for a compute shader, as the model data is going to get loaded into a buffer anyway.</p></div><h2 id="it-s-that-easy" tabindex="-1">It&#39;s that easy! <a class="header-anchor" href="#it-s-that-easy" aria-hidden="true">#</a></h2><p>Most of the <code>wgpu</code> types are <code>Send + Sync</code>, so we can use them in threads without much trouble. It was so easy, that I feel like this tutorial is too short! I&#39;ll just leave off with a speed comparison between the previous model loading code and the current code.</p><div class="language- line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#A6ACCD;">Elapsed (Original): 309.596382ms</span></span>
<span class="line"><span style="color:#A6ACCD;">Elapsed (Threaded): 199.645027ms</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>We&#39;re not loading that many resources, so the speedup is minimal. We&#39;ll be doing more stuff with threading, but this is a good introduction.</p>`,16);function c(D,F,y,C,i,A){const s=e("AutoGithubLink");return o(),a("div",null,[r,l(s)])}const m=n(t,[["render",c]]);export{b as __pageData,m as default};