use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fs::{create_dir_all, File};
use std::io::{BufReader, BufWriter};

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct Settings {
    language: String,
}

impl Settings {
    pub(crate) fn save(self) -> Result<bool, Box<dyn Error>> {
        let dirs = Self::project_dirs();
        let settings_dir = dirs.config_dir();
        create_dir_all(settings_dir)?;
        let settings_path = settings_dir.join("settings.json");
        let file = if settings_path.exists() {
            File::open(settings_path)
        } else {
            File::create(settings_path)
        }?;
        let writer = BufWriter::new(file);
        serde_json::to_writer_pretty(writer, &self)?;
        Ok(true)
    }

    pub(crate) fn load() -> Result<Settings, Box<dyn Error>> {
        let dirs = Self::project_dirs();
        let settings_path = dirs.config_dir().join("settings.json");
        let file = File::open(settings_path)?;
        let reader = BufReader::new(file);
        Ok(serde_json::from_reader(reader)?)
    }

    fn project_dirs() -> ProjectDirs {
        ProjectDirs::from("com", "roudoutyu", "roudoutyu").unwrap()
    }
}
