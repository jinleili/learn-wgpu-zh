mod input;
mod render;
mod sound;
mod state;
mod system;
mod util;

use input::Input;
use system::System;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

use winit::dpi::LogicalSize;
use winit::event::*;
use winit::event_loop::{ControlFlow, EventLoop};
use winit::window::WindowBuilder;

#[cfg_attr(target_arch = "wasm32", wasm_bindgen(start))]
pub fn start() {
    cfg_if::cfg_if! {
        if #[cfg(target_arch = "wasm32")] {
            console_log::init_with_level(log::Level::Warn).expect("Could't initialize logger");
            std::panic::set_hook(Box::new(console_error_panic_hook::hook));
        } else {
            env_logger::init();
        }
    }

    let event_loop = EventLoop::new();
    let size = LogicalSize::new(800, 600);
    let window = WindowBuilder::new()
        .with_visible(false)
        .with_title("Pong")
        .with_inner_size(size)
        .build(&event_loop)
        .unwrap();

    // winit bug: https://github.com/rust-windowing/winit/issues/2876
    if cfg!(not(target_os = "macos")) {
        window.set_max_inner_size(Some(size));
        window.set_resizable(false);
    }

    window.set_cursor_visible(false);

    // 获取物理像素大小
    let size = window.inner_size();

    #[cfg(target_arch = "wasm32")]
    {
        use winit::platform::web::WindowExtWebSys;
        web_sys::window()
            .and_then(|win| win.document())
            .and_then(|doc| {
                match doc.get_element_by_id("wasm-example") {
                    Some(dst) => {
                        let _ = dst.append_child(&web_sys::Element::from(window.canvas()));
                    }
                    None => {
                        let canvas = window.canvas();
                        canvas.style().set_css_text(
                            &(canvas.style().css_text()
                                + "background-color: black; display: block; margin: 20px auto;"),
                        );
                        doc.body()
                            .map(|body| body.append_child(&web_sys::Element::from(canvas)));
                    }
                };

                Some(())
            })
            .expect("Couldn't append canvas to document body.");
    }

    log::info!("Setup...");

    let mut render = pollster::block_on(render::Render::new(&window, size));
    let mut state = state::State {
        ball: state::Ball {
            position: (0.0, 0.0).into(),
            velocity: (0.0, 0.0).into(),
            radius: 0.05,
            visible: true,
        },
        player1: state::Player {
            position: (-0.8, 0.0).into(),
            size: (0.05, 0.4).into(),
            score: 0,
            visible: true,
        },
        player2: state::Player {
            position: (0.8, 0.0).into(),
            size: (0.05, 0.4).into(),
            score: 0,
            visible: true,
        },
        title_text: state::Text {
            position: (20.0, 20.0).into(),
            color: (1.0, 1.0, 1.0, 1.0).into(),
            text: String::from("PONG"),
            size: 64.0,
            ..Default::default()
        },
        play_button: state::Text {
            position: (40.0, 100.0).into(),
            color: (1.0, 1.0, 1.0, 1.0).into(),
            text: String::from("Play"),
            size: 32.0,
            centered: false,
            ..Default::default()
        },
        quit_button: state::Text {
            position: (40.0, 160.0).into(),
            color: (1.0, 1.0, 1.0, 1.0).into(),
            text: String::from("Quit"),
            size: 32.0,
            ..Default::default()
        },
        player1_score: state::Text {
            position: (render.width() * 0.25, 20.0).into(),
            color: (1.0, 1.0, 1.0, 1.0).into(),
            text: String::from("0"),
            size: 32.0,
            ..Default::default()
        },
        player2_score: state::Text {
            position: (render.width() * 0.75, 20.0).into(),
            color: (1.0, 1.0, 1.0, 1.0).into(),
            text: String::from("0"),
            size: 32.0,
            ..Default::default()
        },
        win_text: state::Text {
            position: (render.width() * 0.5, render.height() * 0.5).into(),
            bounds: (render.width(), state::UNBOUNDED_F32).into(),
            size: 32.0,
            centered: true,
            ..Default::default()
        },
        game_state: state::GameState::MainMenu,
    };

    log::info!("Sound...");

    let sound_system = sound::SoundSystem::new();
    let sound_pack = sound::SoundPack::new();
    let mut events = Vec::new();
    let mut input = Input::new();

    log::info!("Initializing Systems...");

    let mut menu_system = system::MenuSystem;
    let mut serving_system = system::ServingSystem::new();
    let mut play_system = system::PlaySystem;
    let ball_system = system::BallSystem;
    let mut game_over_system = system::GameOverSystem::new();

    let mut visiblity_system = system::VisibilitySystem;
    visiblity_system.start(&mut state);

    menu_system.start(&mut state);

    window.set_visible(true);

    log::info!("Event Loop...");

    event_loop.run(move |event, _, control_flow| {
        *control_flow = if state.game_state == state::GameState::Quiting {
            ControlFlow::Exit
        } else {
            ControlFlow::Poll
        };

        match event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => {
                state.game_state = state::GameState::Quiting;
            }
            Event::WindowEvent {
                event:
                    WindowEvent::KeyboardInput {
                        input:
                            KeyboardInput {
                                state: element_state,
                                virtual_keycode: Some(key),
                                ..
                            },
                        ..
                    },
                ..
            } => {
                let input_handled = match state.game_state {
                    state::GameState::Quiting => true,
                    _ => input.update(key, element_state),
                };
                if !input_handled {
                    process_input(element_state, key, control_flow);
                }
            }
            Event::WindowEvent {
                event: WindowEvent::Resized(size),
                ..
            } => {
                // winit bug: https://github.com/rust-windowing/winit/issues/2876
                if cfg!(not(target_os = "macos")) {
                    render.resize(size);
                    events.push(state::Event::Resize(size.width as f32, size.height as f32));
                }
            }
            Event::RedrawEventsCleared => {
                window.request_redraw();
            }
            WindowEvent::RedrawRequested => {
                for event in &events {
                    match event {
                        state::Event::FocusChanged | state::Event::ButtonPressed => {
                            sound_system.queue(sound_pack.bounce());
                        }
                        state::Event::BallBounce(_pos) => {
                            sound_system.queue(sound_pack.bounce());
                        }
                        state::Event::Score(_) => {
                            sound_system.queue(sound_pack.bounce());
                        }
                        state::Event::Resize(width, height) => {
                            // TODO: there should be a system that handles this
                            state.player1_score.position = (width * 0.25, 20.0).into();
                            state.player2_score.position = (width * 0.75, 20.0).into();
                            state.win_text.position = (width * 0.5, height * 0.5).into();
                        }
                    }
                }
                events.clear();

                visiblity_system.update_state(&input, &mut state, &mut events);
                match state.game_state {
                    state::GameState::MainMenu => {
                        menu_system.update_state(&input, &mut state, &mut events);
                        if state.game_state == state::GameState::Serving {
                            serving_system.start(&mut state);
                        }
                    }
                    state::GameState::Serving => {
                        serving_system.update_state(&input, &mut state, &mut events);
                        play_system.update_state(&input, &mut state, &mut events);
                        if state.game_state == state::GameState::Playing {
                            play_system.start(&mut state);
                        }
                    }
                    state::GameState::Playing => {
                        ball_system.update_state(&input, &mut state, &mut events);
                        play_system.update_state(&input, &mut state, &mut events);
                        if state.game_state == state::GameState::Serving {
                            serving_system.start(&mut state);
                        } else if state.game_state == state::GameState::GameOver {
                            game_over_system.start(&mut state);
                        }
                    }
                    state::GameState::GameOver => {
                        game_over_system.update_state(&input, &mut state, &mut events);
                        if state.game_state == state::GameState::MainMenu {
                            menu_system.start(&mut state);
                        }
                    }
                    state::GameState::Quiting => {}
                }

                render.render_state(&state);
                if state.game_state != state::GameState::Quiting {
                    window.request_redraw();
                }
            }
            _ => {}
        }
    });
}

fn process_input(
    element_state: ElementState,
    keycode: VirtualKeyCode,
    control_flow: &mut ControlFlow,
) {
    if let (VirtualKeyCode::Escape, ElementState::Pressed) = (keycode, element_state) {
        *control_flow = ControlFlow::Exit;
    }
}
