# 在 wgpu 项目中集成 `bevy_ecs`

Entity Component System（ECS）是现代游戏引擎和实时渲染引擎中广泛采用的架构模式。它通过将数据（组件）和逻辑（系统）分离，提供了高性能、可扩展且易于维护的代码结构。本节将介绍如何在 wgpu 项目中集成 `bevy_ecs`。


<div class="note">

假定我们的 wgpu 项目就叫 `rend`, 它有两个 crate: `rend-core` 是渲染器核心；`rend-app` 是交互层。

</div>

<img src="./simple_cad.gif" alt="simple cad" />

## 为什么选择 bevy_ecs

在众多 ECS 库中选择 `bevy_ecs`，主要基于以下几个考虑：
- 是 Bevy 引擎的核心组件
- 有活跃的社区，在持续的更新和改进
- 有丰富的示例和教程

## 第零步：在项目中添加依赖
```toml
[dependencies]
bevy_ecs = "0.16"
```

## 第一步：Schedule 与 SubApp
ECS 的驱动需要有调度器。本着抄作业的原则，直接从 `bevy-app` 中搬运 `schedule` 与 `sub_app`：
```
rend_core/
├── src/
│   ├── ecs/
│   │   ├── mod.rs
│   │   ├── ecs_app.rs           # ECS 应用程序封装
│   │   ├── ecs_plugin.rs        # 插件系统
│   │   ├── schedule.rs          # 调度系统
│   │   ├── sub_app.rs           # 子 ECS 程序
│   └── lib.rs
└── Cargo.toml
```
为与了项目中其它 plugin 做区分，我把从 `bevy-app` 中搬运来的 plugin 重命名为了 `EcsPlugin`。

由于我需要的调度器需求比 bevy 引擎简单，所以剔除了大量不需要的代码，整个调度器部分只保留了 50 行：
```rust

/// 定义调度顺序
#[derive(Resource, Debug)]
pub struct MainScheduleOrder {
    /// 主调度顺序
    pub labels: Vec<InternedScheduleLabel>,
    /// 启动阶段（一次性 system）调度顺序
    pub startup_labels: Vec<InternedScheduleLabel>,
}

impl Default for MainScheduleOrder {
    fn default() -> Self {
        Self {
            labels: vec![First.intern(), PreUpdate.intern(), Update.intern(), PostUpdate.intern(), Last.intern()],
            startup_labels: vec![PreStartup.intern(), Startup.intern(), PostStartup.intern()],
        }
    }
}

pub struct MainSchedulePlugin;

impl EcsPlugin for MainSchedulePlugin {
    fn build(&self, app: &mut EcsApp) {
        app.init_resource::<Schedules>().init_resource::<MainScheduleOrder>().add_systems(Main, Main::run_main);
    }
}

#[derive(ScheduleLabel, Clone, Debug, PartialEq, Eq, Hash)]
pub struct Main;

impl Main {
    /// A system that runs the "main schedule"
    pub fn run_main(world: &mut World, mut run_at_least_once: Local<bool>) {
        if !*run_at_least_once {
            world.resource_scope(|world, order: Mut<MainScheduleOrder>| {
                for &label in &order.startup_labels {
                    let _ = world.try_run_schedule(label);
                }
            });
            *run_at_least_once = true;
        }

        world.resource_scope(|world, order: Mut<MainScheduleOrder>| {
            for &label in &order.labels {
                let _ = world.try_run_schedule(label);
            }
        });
    }
}
```

`EcsApp` 也是从 `bevy-app/src/app.rs` 中删减后得来：
```rust
pub struct EcsApp {
    /// 包含"主要"世界的主要子应用程序。
    pub main: SubApp,
    /// 其他带标签的子应用程序。
    pub sub_apps: FastHashMap<InternedAppLabel, SubApp>,
}

impl Default for EcsApp {
    fn default() -> Self {
        let mut app = EcsApp::empty();
        app.main.update_schedule = Some(Main.intern());

        app.add_plugin(MainSchedulePlugin);
        app.add_systems(First, event_update_system.in_set(EventUpdates).run_if(event_update_condition));

        app
    }
}

impl EcsApp {
    pub fn empty() -> EcsApp {
        Self { main: SubApp::new(), sub_apps: FastHashMap::default() }
    }

    /// 为主子应用程序调用 [`update`](SubApp::update)，然后为其余子应用程序
    /// 调用 [`extract`](SubApp::extract) 和 [`update`](SubApp::update)。
    pub fn update(&mut self) {
        {
            self.main.run_default_schedule();
        }
        for (_label, sub_app) in self.sub_apps.iter_mut() {
            sub_app.extract(&mut self.main.world);
            sub_app.update();
        }
        self.main.world.clear_trackers();
    }

    /// 返回 [`World`] 的可变借用.
    pub fn world_mut(&mut self) -> &mut World {
        self.main.world_mut()
    }

    pub fn world(&self) -> &World {
        &self.main.world
    }

    /// 添加插件到 ECS 世界中
    pub fn add_plugin(&mut self, plugin: impl EcsPlugin) -> &mut Self {
        plugin.build(self);
        self
    }

    /// 插入资源到 ECS 世界中
    pub fn insert_resource<R: Resource>(&mut self, value: R) -> &mut Self {
        self.world_mut().insert_resource(value);
        self
    }

    pub fn add_event<T>(&mut self) -> &mut Self
    where
        T: Event,
    {
        self.main.add_event::<T>();
        self
    }

    /// 添加执行系统到 ECS 调度器中
    pub fn add_systems<M>(
        &mut self,
        schedule: impl ScheduleLabel,
        systems: impl IntoScheduleConfigs<ScheduleSystem, M>,
    ) -> &mut Self {
        self.main.add_systems(schedule, systems);
        self
    }
    ...
}
```
## 第二步：实现 InputPlugin 
Bevy 中键鼠事件的管理在 `bevy_input` 中，但是它依赖了 `bevy_app`, 而 `bevy_app` 又依赖了 `bevy_tasks`，所以没有直接依赖此 crate, 而是从 `bevy_input` 中提取出自己需要的部分：
```rust
pub struct InputPlugin;

impl EcsPlugin for InputPlugin {
    fn build(&self, app: &mut EcsApp) {
        app
            // 键盘
            .add_event::<KeyboardInput>()
            .add_event::<KeyboardFocusLost>()
            .init_resource::<ButtonInput<KeyCode>>()
            .add_systems(PreUpdate, keyboard_input_system.in_set(InputSystem))
            // 鼠标
            .add_event::<MouseButtonInput>()
            .add_event::<MouseMotion>()
            .add_event::<MouseWheel>()
            .init_resource::<ButtonInput<MouseButton>>()
            .add_event::<CursorMoved>()
            .add_event::<CursorEntered>()
            .add_event::<CursorLeft>()
            // rend 窗口事件
            .add_event::<WindowEvent>()
            .add_event::<ViewportResized>()
            .add_event::<SurfaceScaleFactorChanged>()
            .add_event::<RequestRedraw>()
            .add_systems(PreUpdate,
                (
                    mouse_button_input_system,
                    accumulate_mouse_motion_system,
                    accumulate_mouse_scroll_system,
                )
                    .in_set(InputSystem),
            )
            .init_resource::<AccumulatedMouseMotion>()
            .init_resource::<AccumulatedMouseScroll>();
    }
}
```

## 第三步：将 EcsApp 集成到 RendApp 中

```rust
pub struct RendApp {
    pub renderer: Arc<Renderer>,
    pub ecs: EcsApp,
    /// 待发送到 ecs world 的事件
    pub window_events: Vec<RendWindowEvent>,

    #[cfg(not(target_arch = "wasm32"))]
    pub raw_winit_events: Vec<RawWinitWindowEvent>,
    ...
}

impl Deref for RendApp {
    type Target = EcsApp;

    fn deref(&self) -> &Self::Target {
        &self.ecs
    }
}
```

从上面的代码可以看到，RendApp 在 Web 环境中没有使用 `winit`, 那如何管理窗口及键鼠事件呢？

```rust
/// canvas device pixel ratio 改变
#[wasm_bindgen]
pub fn on_device_pixel_ratio_change(ptr: u64, ratio: f32) {
    let app = unsafe { &mut *(ptr as *mut RendApp) };
    app.send_event(SurfaceScaleFactorChanged { scale_factor: ratio, window: Entity::PLACEHOLDER });
}

/// 鼠标移动
#[wasm_bindgen]
pub fn on_pointer_move(ptr: u64, current_x: f32, current_y: f32, delta_x: f32, delta_y: f32) {
    let app = unsafe { &mut *(ptr as *mut RendApp) };
    app.send_event(CursorMoved {
        delta: Some(Vec2::new(delta_x, delta_y)),
        position: Vec2::new(current_x, current_y),
        window: Entity::PLACEHOLDER,
    });
}
```

帧循环中执行 ECS 调度，`run_ecs_schedule` 是由 `bevy_winit/src/state.rs` 中的 `run_app_update` 与 `forward_bevy_events` 函数改造而来：

```rust
pub fn request_redraw(&mut self) {
    self.send_event(RequestRedraw {});
    self.run_ecs_schedule();
}

 pub fn run_ecs_schedule(&mut self) {
    self.forward_events();

    let mut draining_cmds = {
        let mut delayed_hotkey = self.ecs.get_non_send_resource_mut::<DelayedCmds>();
        delayed_hotkey.drain()
    };

    draining_cmds.before_ecs_update(&mut self.ecs);

    self.ecs.update();

    // 释放热键
    draining_cmds.after_ecs_update(&mut self.ecs);
}
```

接下来就可以在项目中使用 ECS 了。

## 使用 ECS 架构实现相机交互

### 相机组件定义

首先，定义相机相关的组件：

```rust
// rend_app/src/camera/mod.rs

/// 相机激活标记
#[derive(Component)]
pub struct IsActive;

/// 相机类型
#[derive(Component)]
pub enum CameraType {
    /// 鸟瞰相机
    Orbit,
    /// 视口旋转相机
    VpRotation,
    /// 平面相机
    Plane,
}

/// 鸟瞰相机组件
#[derive(Component)]
pub struct OrbitCamera {
    /// 相机数据
    data: Camera,
    /// 动画相机
    anim_camera: Camera3d,
    /// 变更标记
    changed: bool,
}

/// 平面相机组件
#[derive(Component)]
pub struct PlaneCamera {
    data: Camera,
    changed: bool,
}
```

### 相机行为 trait

为了统一不同类型相机的行为，定义了 `CameraAction` trait：

```rust
// rend_app/src/camera/action.rs

/// 相机行为 trait
pub trait CameraAction {
    /// 获取相机数据
    fn get_camera(&mut self, render_state: &mut RenderState) -> Option<Camera>;
    
    /// 设置分辨率
    fn set_resolution(&mut self, res: UVec2);
    
    /// 处理鼠标滚轮事件
    fn on_mouse_wheel(&mut self, delta: f32);
    
    /// 处理光标移动事件
    fn on_cursor_move(&mut self, pos: Vec2, delta: Vec2);
    
    /// 移动相机
    fn move_forward(&mut self, delta: f32);
    fn move_right(&mut self, delta: f32);
    fn move_up(&mut self, delta: f32);
    
    /// 旋转相机
    fn rotation_to(&mut self, target_theta: f32, target_phi: f32, needs_anim: bool);
}

impl CameraAction for OrbitCamera {
    fn get_camera(&mut self, render_state: &mut RenderState) -> Option<Camera> {
        if !self.changed {
            return None;
        }
        ...
        Some(self.data)
    }
    
    fn on_cursor_move(&mut self, _pos: Vec2, delta: Vec2) {
        let resolution = self.resolution().as_vec2();
        self.anim_camera.on_cursor_move(resolution, delta);
        self.changed = true;
    }
    
    fn on_mouse_wheel(&mut self, delta: f32) {
        self.anim_camera.on_mouse_wheel(delta);
        self.changed = true;
    }
    
    // ... 其他方法实现
}
```

### 相机系统实现

接下来实现相机交互系统：

```rust
// rend_app/src/camera/mod.rs

/// 相机(视口)分辨率变化系统
pub fn camera_resolution_change(
    mut camera3d_query: Query<&mut OrbitCamera>,
    mut camera2d_query: Query<&mut PlaneCamera>,
    mut resize_reader: EventReader<ViewportResized>,
) {
    let Some(sized) = resize_reader.read().last() else {
        return;
    };
    
    // 更新 3D 相机
    for mut camera in camera3d_query.iter_mut() {
        camera.set_resolution(sized.resolution);
    }
    
    // 更新 2D 相机 ...
}

/// 相机交互系统

pub fn camera_action_system(
    renderer: NonSend<Arc<Renderer>>,
    mut render_state: NonSendMut<RenderState>,
    mut res_camera: ResMut<ResCamera>,
    mut orbit_query: Query<CameraQuery<OrbitCamera>, With<IsActive>>,
    mut plane_query: Query<CameraQuery<PlaneCamera>, With<IsActive>>,
    mut vp_rotation_query: Query<CameraQuery<VpRotationCamera>, With<IsActive>>,
    mouse_buttons: Res<ButtonInput<MouseButton>>,
    key_codes: Res<ButtonInput<KeyCode>>,
    mut event_rw: CameraEventRW,
) {
    if render_state.interaction_state.is_gizmo_interacting() {
        return;
    }
    // 先尝试获取 orbit 相机
    if let Ok(mut query) = orbit_query.single_mut() {
        handle_camera::<OrbitCamera>(
            &renderer,
            &mut render_state,
            &mut res_camera,
            &mut query.camera,
            &mouse_buttons,
            &key_codes,
            &mut event_rw,
        );
        return;
    }

    // 如果没有 orbit 相机，尝试获取 plane 相机
    if let Ok(mut query) = plane_query.single_mut() {
        handle_camera::<PlaneCamera>(
            &renderer,
            &mut render_state,
            &mut res_camera,
            &mut query.camera,
            &mouse_buttons,
            &key_codes,
            &mut event_rw,
        );
        return;
    }

    // 如果没有 orbit 和 plane 相机，尝试获取 VP 旋转相机
    if let Ok(mut query) = vp_rotation_query.single_mut() {
        handle_camera::<VpRotationCamera>(
            &renderer,
            &mut render_state,
            &mut res_camera,
            &mut query.camera,
            &mouse_buttons,
            &key_codes,
            &mut event_rw,
        );
    }
}

fn handle_camera<T: CameraAction>(
    renderer: &Arc<Renderer>,
    render_state: &mut RenderState,
    res_camera: &mut ResCamera,
    camera: &mut T,
    mouse_buttons: &ButtonInput<MouseButton>,
    key_codes: &ButtonInput<KeyCode>,
    event_rw: &mut CameraEventRW,
) {
    let mut is_wheeled = false;
    let is_alt_pressed = key_codes.pressed(KeyCode::AltLeft) || key_codes.pressed(KeyCode::AltRight);
    if (is_alt_pressed || mouse_buttons.pressed(MouseButton::Left))
        && render_state.interaction_state.can_camera_dragging()
    {
        render_state.camera_interaction_state.set_drag_start();
        // 旋转
        for event in event_rw.cursor_reader.read() {
            if let Some(delta) = event.delta {
                camera.on_cursor_move(event.position, delta, &mut event_rw.orbit_writer);
                render_state.camera_interaction_state.set_dragging();
            }
        }
    } else {
        // 缩放
        if !camera.is_vp_rotation_camera() {
            for event in event_rw.wheel_reader.read() {
                camera.on_mouse_wheel(event.y + event.x);
                render_state.set_waiting_zoom_or_resize();
                is_wheeled = true;
            }
        }
    }

    // 只要符合结束条件，则须不受其他状态影响地优先执行结束操作
    if mouse_buttons.just_released(MouseButton::Left)
        || key_codes.just_released(KeyCode::AltLeft)
        || key_codes.just_released(KeyCode::AltRight)
    {
        render_state.camera_operation_finished();
    }

    // 只有在没触发 on_cursor_move 时，才报告鼠标位置
    // NOTE:
    // 刻意将 report_cursor_pos 放在 on_cursor_move 执行条件之后，
    // 因为 reader 只能对事件读取一遍, 提前报告会导致 on_cursor_move 无法触发
    if let Some(event) = event_rw.cursor_reader.read().last() {
        camera.report_cursor_pos(event.position);
    }

    // ADWSQE 平移
    let speed = 20. * render_state.scale_factor;

    if key_codes.pressed(KeyCode::KeyW) {
        camera.move_forward(speed);
    } else if key_codes.pressed(KeyCode::KeyS) {
        camera.move_forward(-speed);
    } else if key_codes.pressed(KeyCode::KeyD) {
        camera.move_right(speed);
    } else if key_codes.pressed(KeyCode::KeyA) {
        camera.move_right(-speed);
    } else if key_codes.pressed(KeyCode::KeyQ) {
        camera.move_up(speed);
    } else if key_codes.pressed(KeyCode::KeyE) {
        camera.move_up(-speed);
    }
}
```

### 相机系统集成

最后，需要将相机系统集成到主应用程序中。 `rend-app` 是个多视口 app, 每个视口关联了一个相机，所以将相机系统放在 `ViewportPlugin` 中：

```rust
// rend_app/src/viewport/mod.rs

/// 视口管理插件
pub struct ViewportPlugin;

impl EcsPlugin for ViewportPlugin {
    fn build(&self, app: &mut EcsApp) {
        // ...
        app.add_systems(PreUpdate, (camera_resolution_change.in_set(ResizeSet),));
        app.add_systems(Update, (vp_active.after(InputSystem),).in_set(ViewportSet));
        app.add_systems(
            Update,
            (
                flush_camera_change_state,
                camera_inner_rotation,
                camera_action_system.run_if(is_not_ui_interacting),
                vp_rotation_gizmo_action,
            )
                .chain()
                .in_set(CameraSet)
                .after(GizmosSystemSet::Update),
        );
    }
}
```