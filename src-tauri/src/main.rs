#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use tauri::{CustomMenuItem, Menu, MenuEntry, Submenu};

mod version;

#[tauri::command]
fn get_current_version() -> String {
    version::CURRENT_VERSION.to_string()
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

const MENU_UPDATE_CHECK: &str = "update check";

fn main() {
    let context = tauri::generate_context!();
    let mut menu = Menu::os_default(&context.package_info().name);
    let update_check = CustomMenuItem::new(MENU_UPDATE_CHECK, "(Beta) Check for updates...");
    #[cfg(target_os = "macos")]
    if let MenuEntry::Submenu(sub_menu) = &mut menu.items[0] {
        sub_menu
            .inner
            .items
            .insert(1, MenuEntry::CustomItem(update_check));
    }
    #[cfg(not(target_os = "macos"))]
    {
        menu = menu.add_submenu(Submenu::new("Tools", Menu::new().add_item(update_check)));
    }

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| {
            match event.menu_item_id() {
                MENU_UPDATE_CHECK => {
                    event
                        .window()
                        .emit_and_trigger("tauri://update", ())
                        .unwrap();
                }
                m => println!("{}", m),
            };
        })
        .invoke_handler(tauri::generate_handler![greet, get_current_version])
        .run(context)
        .expect("error while running tauri application");
}
