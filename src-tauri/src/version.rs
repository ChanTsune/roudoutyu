use github_release_check::GitHub;
use semver::Version;
use std::error::Error;

pub(crate) const CURRENT_VERSION: &str = env!("CARGO_PKG_VERSION");

fn get_all_raw_versions() -> Result<Vec<String>, Box<dyn Error>> {
    let client = GitHub::new()?;
    let version = client.get_all_versions("ChanTsune/roudoutyu")?;
    Ok(version)
}

fn get_all_versions() -> Vec<Version> {
    let versions = get_all_raw_versions().unwrap_or_default();
    versions
        .into_iter()
        .map(|it| {
            it.strip_prefix("app-v")
                .and_then(|it| Version::parse(it).ok())
        })
        .collect::<Option<_>>()
        .unwrap_or_default()
}

fn get_latest_version() -> Option<Version> {
    get_all_versions().into_iter().max()
}

fn get_current_version() -> Version {
    Version::parse(CURRENT_VERSION).unwrap()
}

pub(crate) fn is_this_latest_version() -> bool {
    get_latest_version().unwrap() <= get_current_version()
}
