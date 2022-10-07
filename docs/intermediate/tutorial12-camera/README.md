# 更好的摄像机

这个问题已经被推迟了一段时间。实现一个**虚拟摄像机**与正确使用 wgpu 关系不大，但它一直困扰着我，所以现在来实现它吧。

`lib.rs` 已经堆砌很多代码了，所以我们创建一个 `camera.rs` 文件来放置摄像机代码。先导入一些要用到的文件并移置 `OPENGL_TO_WGPU_MATRIX`：

```rust
use cgmath::*;
use winit::event::*;
use winit::dpi::PhysicalPosition;
use instant::Duration;
use std::f32::consts::FRAC_PI_2;

#[rustfmt::skip]
pub const OPENGL_TO_WGPU_MATRIX: cgmath::Matrix4<f32> = cgmath::Matrix4::new(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 0.5, 0.0,
    0.0, 0.0, 0.5, 1.0,
);

const SAFE_FRAC_PI_2: f32 = FRAC_PI_2 - 0.0001;
```

<div class="note">

在 WASM 中使用 `std::time::instant` 会导致程序**恐慌**，所以我们使用 [instant](https://docs.rs/instant) 包来替代，在  `Cargo.toml` 引入此依赖：

```toml
instant = "0.1"
```

</div>

## 虚拟摄像机

接下来，需要创建一个新的 `Camera` 结构体。我们将使用一个 FPS 风格的摄像机，所以要存储位置（position）、 yaw（偏航，水平旋转）以及 pitch（俯仰，垂直旋转）， 定义并实现一个 `calc_matrix` 函数用于创建视图矩阵：

```rust
#[derive(Debug)]
pub struct Camera {
    pub position: Point3<f32>,
    yaw: Rad<f32>,
    pitch: Rad<f32>,
}

impl Camera {
    pub fn new<
        V: Into<Point3<f32>>,
        Y: Into<Rad<f32>>,
        P: Into<Rad<f32>>,
    >(
        position: V,
        yaw: Y,
        pitch: P,
    ) -> Self {
        Self {
            position: position.into(),
            yaw: yaw.into(),
            pitch: pitch.into(),
        }
    }

    pub fn calc_matrix(&self) -> Matrix4<f32> {
        Matrix4::look_to_rh(
            self.position,
            Vector3::new(
                self.yaw.0.cos(),
                self.pitch.0.sin(),
                self.yaw.0.sin(),
            ).normalize(),
            Vector3::unit_y(),
        )
    }
}
```

## 投影

只有在窗口调整大小时，**投影**（Projection）才真正需要改变，所以我们将投影与摄像机分开，创建一个 `Projection` 结构体：

```rust
pub struct Projection {
    aspect: f32,
    fovy: Rad<f32>,
    znear: f32,
    zfar: f32,
}

impl Projection {
    pub fn new<F: Into<Rad<f32>>>(
        width: u32,
        height: u32,
        fovy: F,
        znear: f32,
        zfar: f32,
    ) -> Self {
        Self {
            aspect: width as f32 / height as f32,
            fovy: fovy.into(),
            znear,
            zfar,
        }
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        self.aspect = width as f32 / height as f32;
    }

    pub fn calc_matrix(&self) -> Matrix4<f32> {
        OPENGL_TO_WGPU_MATRIX * perspective(self.fovy, self.aspect, self.znear, self.zfar)
    }
}
```

有一点需要注意：`cgmath` 从 `perspective` 函数返回的是**右手坐标系**（right-handed coordinate system）的投影矩阵。也就是说，Z 轴是指向屏幕外的，想让 Z 轴指向*屏幕内*（也就是**左手坐标系**的投影矩阵）就得自己编码。

可以这样分辨右手坐标系和左手坐标系的区别：在身体的正前方把你的拇指指向右边代表 X 轴，食指指向上方代表 Y 轴，伸出中指代表 Z 轴。此时在你的右手上，中指应该指是向你自己。而在左手上，应该是指向远方。

![./left_right_hand.gif](./left_right_hand.gif)

# 摄像机控制器

现在，我们需要一个新的摄像机控制器，在 `camera.rs` 中添加以下代码：

```rust
#[derive(Debug)]
pub struct CameraController {
    amount_left: f32,
    amount_right: f32,
    amount_forward: f32,
    amount_backward: f32,
    amount_up: f32,
    amount_down: f32,
    rotate_horizontal: f32,
    rotate_vertical: f32,
    scroll: f32,
    speed: f32,
    sensitivity: f32,
}

impl CameraController {
    pub fn new(speed: f32, sensitivity: f32) -> Self {
        Self {
            amount_left: 0.0,
            amount_right: 0.0,
            amount_forward: 0.0,
            amount_backward: 0.0,
            amount_up: 0.0,
            amount_down: 0.0,
            rotate_horizontal: 0.0,
            rotate_vertical: 0.0,
            scroll: 0.0,
            speed,
            sensitivity,
        }
    }

    pub fn process_keyboard(&mut self, key: VirtualKeyCode, state: ElementState) -> bool{
        let amount = if state == ElementState::Pressed { 1.0 } else { 0.0 };
        match key {
            VirtualKeyCode::W | VirtualKeyCode::Up => {
                self.amount_forward = amount;
                true
            }
            VirtualKeyCode::S | VirtualKeyCode::Down => {
                self.amount_backward = amount;
                true
            }
            VirtualKeyCode::A | VirtualKeyCode::Left => {
                self.amount_left = amount;
                true
            }
            VirtualKeyCode::D | VirtualKeyCode::Right => {
                self.amount_right = amount;
                true
            }
            VirtualKeyCode::Space => {
                self.amount_up = amount;
                true
            }
            VirtualKeyCode::LShift => {
                self.amount_down = amount;
                true
            }
            _ => false,
        }
    }

    pub fn process_mouse(&mut self, mouse_dx: f64, mouse_dy: f64) {
        self.rotate_horizontal = mouse_dx as f32;
        self.rotate_vertical = mouse_dy as f32;
    }

    pub fn process_scroll(&mut self, delta: &MouseScrollDelta) {
        self.scroll = -match delta {
            // 假定一行为 100 个像素，你可以随意修改这个值
            MouseScrollDelta::LineDelta(_, scroll) => scroll * 100.0,
            MouseScrollDelta::PixelDelta(PhysicalPosition {
                y: scroll,
                ..
            }) => *scroll as f32,
        };
    }

    pub fn update_camera(&mut self, camera: &mut Camera, dt: Duration) {
        let dt = dt.as_secs_f32();

        // 前后左右移动
        let (yaw_sin, yaw_cos) = camera.yaw.0.sin_cos();
        let forward = Vector3::new(yaw_cos, 0.0, yaw_sin).normalize();
        let right = Vector3::new(-yaw_sin, 0.0, yaw_cos).normalize();
        camera.position += forward * (self.amount_forward - self.amount_backward) * self.speed * dt;
        camera.position += right * (self.amount_right - self.amount_left) * self.speed * dt;

        // 变焦（缩放）
        // 注意：这不是一个真实的变焦。
        // 通过摄像机的位置变化来模拟变焦，使你更容易靠近想聚焦的物体。
        let (pitch_sin, pitch_cos) = camera.pitch.0.sin_cos();
        let scrollward = Vector3::new(pitch_cos * yaw_cos, pitch_sin, pitch_cos * yaw_sin).normalize();
        camera.position += scrollward * self.scroll * self.speed * self.sensitivity * dt;
        self.scroll = 0.0;

        // 由于我们没有使用滚动，所以直接修改 y 坐标来上下移动。
        camera.position.y += (self.amount_up - self.amount_down) * self.speed * dt;

        // 旋转
        camera.yaw += Rad(self.rotate_horizontal) * self.sensitivity * dt;
        camera.pitch += Rad(-self.rotate_vertical) * self.sensitivity * dt;

        // 重置旋转值为 0。没有鼠标移动发生时，摄像机就停止旋转。
        self.rotate_horizontal = 0.0;
        self.rotate_vertical = 0.0;

        // 保持摄像机的角度不要太高/太低。
        if camera.pitch < -Rad(SAFE_FRAC_PI_2) {
            camera.pitch = -Rad(SAFE_FRAC_PI_2);
        } else if camera.pitch > Rad(SAFE_FRAC_PI_2) {
            camera.pitch = Rad(SAFE_FRAC_PI_2);
        }
    }
}
```

## 清理 `lib.rs`

首先，我们从 `lib.rs` 中删除 `Camera` 、 `CameraController` 以及额外的 `OPENGL_TO_WGPU_MATRIX`，然后导入 `camera.rs`：

```rust
mod model;
mod texture;
mod camera; // 新增!
```

接着更新 `update_view_proj` 以使用新的 `Camera` 和 `Projection`：

```rust

impl CameraUniform {
    // ...

    // 更新!
    fn update_view_proj(&mut self, camera: &camera::Camera, projection: &camera::Projection) {
        self.view_position = camera.position.to_homogeneous().into();
        self.view_proj = (projection.calc_matrix() * camera.calc_matrix()).into();
    }
}
```

我们还要修改 `State` 来使用新的 `Camera`、`CameraProjection` 和 `Projection`，再添加一个`mouse_pressed` 字段来存储鼠标是否被按下：

```rust
struct State {
    // ...
    camera: camera::Camera, // 更新!
    projection: camera::Projection, // 新增!
    camera_controller: camera::CameraController, // 更新!
    // ...
    // 新增!
    mouse_pressed: bool,
}
```

别忘了需要导入 `winit::dpi::PhysicalPosition`。

然后更新 `new()` 函数：

```rust
impl State {
    async fn new(window: &Window) -> Self {
        // ...

        // 更新!
        let camera = camera::Camera::new((0.0, 5.0, 10.0), cgmath::Deg(-90.0), cgmath::Deg(-20.0));
        let projection = camera::Projection::new(config.width, config.height, cgmath::Deg(45.0), 0.1, 100.0);
        let camera_controller = camera::CameraController::new(4.0, 0.4);

        // ...

        camera_uniform.update_view_proj(&camera, &projection); // 更新!

        // ...

        Self {
            // ...
            camera,
            projection, // 新增!
            camera_controller,
            // ...
            mouse_pressed: false, // 新增!
        }
    }
}
```

接着在 `resize` 函数中更新投影矩阵 `projection`：

```rust
fn resize(&mut self, new_size: winit::dpi::PhysicalSize<u32>) {
    // 更新!
    self.projection.resize(new_size.width, new_size.height);
    // ...
}
```

事件输入函数 `input()` 也需要被更新。
到目前为止，我们一直在使用 `WindowEvent` 来控制摄像机，这很有效，但它并不是最好的解决方案。[winit 文档](https://docs.rs/winit/0.24.0/winit/event/enum.WindowEvent.html?search=#variant.CursorMoved)告诉我们，操作系统通常会对 `CursorMoved` 事件的数据进行转换，以实现光标加速等效果。

现在为了解决这个问题，可以修改 `input()` 函数来处理 `DeviceEvent` 而不是 `WindowEvent`，但是在 macOS 和 WASM 上，键盘和按键事件不会被当作 `DeviceEvent` 发送出来。
做为替代方案，我们删除 `input()` 中的 `CursorMoved` 检查，并在 `run()` 函数中手动调用 `camera_controller.process_mouse()`：

```rust
// 更新!
fn input(&mut self, event: &WindowEvent) -> bool {
    match event {
        WindowEvent::KeyboardInput {
            input:
                KeyboardInput {
                    virtual_keycode: Some(key),
                    state,
                    ..
                },
            ..
        } => self.camera_controller.process_keyboard(*key, *state),
        WindowEvent::MouseWheel { delta, .. } => {
            self.camera_controller.process_scroll(delta);
            true
        }
        WindowEvent::MouseInput {
            button: MouseButton::Left,
            state,
            ..
        } => {
            self.mouse_pressed = *state == ElementState::Pressed;
            true
        }
        _ => false,
    }
}
```

下面是对事件循环代理（event_loop）的 `run()` 函数的修改：

```rust
fn main() {
    // ...
    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Poll;
        match event {
            // ...
            // 新增!
            Event::DeviceEvent {
                event: DeviceEvent::MouseMotion{ delta, },
                .. // 我们现在没有用到 device_id 
            } => if state.mouse_pressed {
                state.camera_controller.process_mouse(delta.0, delta.1)
            }
            // 更新!
            Event::WindowEvent {
                ref event,
                window_id,
            } if window_id == state.app.view.id() && !state.input(event) => {
                match event {
                    #[cfg(not(target_arch="wasm32"))]
                    WindowEvent::CloseRequested
                    | WindowEvent::KeyboardInput {
                        input:
                            KeyboardInput {
                                state: ElementState::Pressed,
                                virtual_keycode: Some(VirtualKeyCode::Escape),
                                ..
                            },
                        ..
                    } => *control_flow = ControlFlow::Exit,
                    WindowEvent::Resized(physical_size) => {
                        state.resize(*physical_size);
                    }
                    WindowEvent::ScaleFactorChanged { new_inner_size, .. } => {
                        state.resize(**new_inner_size);
                    }
                    _ => {}
                }
            }
            // ...
        }
    });
}
```

`update` 函数需要多解释一下：`CameraController` 上的 `update_camera` 函数有一个参数 `dt`，它是**帧**之间的**时间差**（delta time，也可以说是时间间隔），用来辅助实现摄像机的平滑移动，使其不被**帧速率**所锁定。所以将它作为一个参数传入 `update`：

```rust
fn update(&mut self, dt: instant::Duration) {
    // 更新!
    self.camera_controller.update_camera(&mut self.camera, dt);
    self.camera_uniform.update_view_proj(&self.camera, &self.projection);

    // ..
}
```

既然如此，我们也用 `dt` 来平滑光源的旋转：

```rust
self.light_uniform.position =
    (cgmath::Quaternion::from_axis_angle((0.0, 1.0, 0.0).into(), cgmath::Deg(60.0 * dt.as_secs_f32()))
    * old_position).into(); // 更新!
```

让我们在 `main` 函数中来实现 `dt` 的具体计算：

```rust
fn main() {
    // ...
    let mut state = State::new(&window).await;
    let mut last_render_time = instant::Instant::now();  // 新增!
    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Poll;
        match event {
            // ...
            // 更新!
            Event::RedrawRequested(window_id) if window_id == state.app.view.id() => {
                let now = instant::Instant::now();
                let dt = now - last_render_time;
                last_render_time = now;
                state.update(dt);
                // ...
            }
            _ => {}
        }
    });
}
```

现在，我们应该可以自由控制摄像机了：

![./screenshot.png](./screenshot.png)

<WasmExample example="tutorial12_camera"></WasmExample>

<AutoGithubLink/>
