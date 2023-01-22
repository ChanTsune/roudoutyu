#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use crate::settings::Settings;
use crate::version::is_this_latest_version;
use tauri::{CustomMenuItem, Menu, MenuEntry};

mod settings;
mod version;

#[tauri::command]
fn get_current_version() -> String {
    version::CURRENT_VERSION.to_string()
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn save_settings(settings: Settings) -> Result<bool, String> {
    settings.save().map_err(|e| e.to_string())
}

#[tauri::command]
fn load_settings() -> Result<Settings, String> {
    Settings::load().map_err(|e| e.to_string())
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
        use tauri::Submenu;
        menu = menu.add_submenu(Submenu::new("Tools", Menu::new().add_item(update_check)));
    }

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| {
            match event.menu_item_id() {
                MENU_UPDATE_CHECK => {
                    event
                        .window()
                        .emit("check-update", is_this_latest_version())
                        .unwrap();
                }
                m => println!("{}", m),
            };
        })
        .invoke_handler(tauri::generate_handler![
            get_current_version,
            save_settings,
            load_settings,
        ])
        .run(context)
        .expect("error while running tauri application");
}
