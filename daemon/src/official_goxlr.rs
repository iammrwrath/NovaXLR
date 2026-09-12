use std::fs;
use std::path::{Path, PathBuf};

use anyhow::{Result, anyhow};
use log::{debug, info, warn};
use quick_xml::Reader;
use quick_xml::events::Event;

use crate::SettingsHandle;
use crate::files::FilePaths;

#[derive(Debug, Default, Clone)]
pub struct ImportSummary {
    pub profiles: usize,
    pub mic_profiles: usize,
    pub presets: usize,
    pub icons: usize,
    pub samples: usize,
    pub active_profile: Option<String>,
    pub active_mic_profile: Option<String>,
}

#[derive(Debug, Default, Clone)]
struct OfficialConfig {
    profile_path: Option<PathBuf>,
    mic_profiles_path: Option<PathBuf>,
    preset_path: Option<PathBuf>,
    icon_path: Option<PathBuf>,
    samples_path: Option<PathBuf>,
    last_loaded_profile: Option<String>,
    last_loaded_mic_profile: Option<String>,
}

/// Returns the path to %APPDATA%\TC-Helicon\GoXLR\GoXLR.settings if on Windows.
fn get_official_settings_file() -> Option<PathBuf> {
    #[cfg(windows)]
    {
        if let Ok(appdata) = std::env::var("APPDATA") {
            let path = PathBuf::from(appdata)
                .join("TC-Helicon")
                .join("GoXLR")
                .join("GoXLR.settings");
            if path.exists() {
                return Some(path);
            }
        }
    }
    None
}

/// Parse %APPDATA%\TC-Helicon\GoXLR\GoXLR.settings using quick-xml.
fn parse_official_settings(settings_file: &Path) -> Result<OfficialConfig> {
    let content = fs::read_to_string(settings_file)?;
    let mut reader = Reader::from_str(&content);
    reader.config_mut().trim_text(true);

    let mut config = OfficialConfig::default();
    let mut buf = Vec::new();

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Empty(ref e)) | Ok(Event::Start(ref e)) => {
                if e.name().as_ref() == b"VALUE" {
                    let mut name = String::new();
                    let mut val = String::new();

                    for attr in e.attributes().flatten() {
                        if attr.key.as_ref() == b"name" {
                            if let Ok(v) = attr.unescape_value() {
                                name = v.to_string();
                            }
                        } else if attr.key.as_ref() == b"val" {
                            if let Ok(v) = attr.unescape_value() {
                                val = v.to_string();
                            }
                        }
                    }

                    if !val.is_empty() {
                        match name.as_str() {
                            "profilePath" => {
                                let p = PathBuf::from(&val);
                                if p.exists() {
                                    config.profile_path = Some(p);
                                }
                            }
                            "micProfilesPath" => {
                                let p = PathBuf::from(&val);
                                if p.exists() {
                                    config.mic_profiles_path = Some(p);
                                }
                            }
                            "presetPath" => {
                                let p = PathBuf::from(&val);
                                if p.exists() {
                                    config.preset_path = Some(p);
                                }
                            }
                            "iconPath" => {
                                let p = PathBuf::from(&val);
                                if p.exists() {
                                    config.icon_path = Some(p);
                                }
                            }
                            "samplesPath" => {
                                let p = PathBuf::from(&val);
                                if p.exists() {
                                    config.samples_path = Some(p);
                                }
                            }
                            "lastLoadedProfile" => {
                                let clean = val.trim_end_matches(".goxlr").to_string();
                                if !clean.is_empty() {
                                    config.last_loaded_profile = Some(clean);
                                }
                            }
                            "LastLoadedMicProfile" => {
                                let clean = val.trim_end_matches(".goxlrMicProfile").to_string();
                                if !clean.is_empty() {
                                    config.last_loaded_mic_profile = Some(clean);
                                }
                            }
                            _ => {}
                        }
                    }
                }
            }
            Ok(Event::Eof) => break,
            Err(e) => {
                warn!("Error parsing official GoXLR.settings: {}", e);
                break;
            }
            _ => {}
        }
        buf.clear();
    }

    Ok(config)
}

/// Collect standard candidate directories on Windows where GoXLR files commonly live.
fn get_standard_goxlr_base_dirs() -> Vec<PathBuf> {
    let mut dirs = Vec::new();

    #[cfg(windows)]
    {
        // 1. Check directories::UserDirs document_dir
        if let Some(user_dirs) = directories::UserDirs::new() {
            if let Some(doc_dir) = user_dirs.document_dir() {
                let doc_goxlr = doc_dir.join("GoXLR");
                if doc_goxlr.exists() && !dirs.contains(&doc_goxlr) {
                    dirs.push(doc_goxlr);
                }
            }
        }

        // 2. Check USERPROFILE\OneDrive\Documents\GoXLR
        if let Ok(userprofile) = std::env::var("USERPROFILE") {
            let onedrive_goxlr = PathBuf::from(&userprofile)
                .join("OneDrive")
                .join("Documents")
                .join("GoXLR");
            if onedrive_goxlr.exists() && !dirs.contains(&onedrive_goxlr) {
                dirs.push(onedrive_goxlr);
            }

            // 3. Check USERPROFILE\Documents\GoXLR
            let local_goxlr = PathBuf::from(&userprofile).join("Documents").join("GoXLR");
            if local_goxlr.exists() && !dirs.contains(&local_goxlr) {
                dirs.push(local_goxlr);
            }
        }
    }

    dirs
}

/// Checks whether official GoXLR profiles or settings exist on this machine.
pub fn is_official_goxlr_detected() -> bool {
    if get_official_settings_file().is_some() {
        return true;
    }

    for base in get_standard_goxlr_base_dirs() {
        if base.exists() {
            let profiles = base.join("Profiles");
            if profiles.exists() {
                return true;
            }
        }
    }

    false
}

/// Helper to copy files matching extensions from source directory to target directory.
fn copy_files_with_extensions(
    source_dir: &Path,
    target_dir: &Path,
    backup_dir: &Path,
    extensions: &[&str],
    mut is_valid_file: impl FnMut(&Path) -> bool,
) -> usize {
    let mut count = 0;
    let Ok(entries) = fs::read_dir(source_dir) else {
        return 0;
    };

    let _ = fs::create_dir_all(target_dir);

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }

        let Some(ext) = path.extension().and_then(|e| e.to_str()) else {
            continue;
        };

        let ext_matches = extensions
            .iter()
            .any(|e| ext.eq_ignore_ascii_case(e));
        if !ext_matches {
            continue;
        }

        if !is_valid_file(&path) {
            debug!("Skipping invalid/empty file: {:?}", path);
            continue;
        }

        let Some(file_name) = path.file_name() else {
            continue;
        };

        let dest = target_dir.join(file_name);

        // If destination file exists, check if contents are already identical
        if dest.exists() {
            if let (Ok(meta_src), Ok(meta_dst)) = (path.metadata(), dest.metadata()) {
                if meta_src.len() == meta_dst.len() {
                    // Same size, skip re-copying
                    continue;
                }
            }

            // Create backup of current destination file
            let _ = fs::create_dir_all(backup_dir);
            let backup_dest = backup_dir.join(file_name);
            let _ = fs::copy(&dest, &backup_dest);
            debug!("Backed up existing file to {:?}", backup_dest);
        }

        match fs::copy(&path, &dest) {
            Ok(_) => {
                info!("Imported: {:?} -> {:?}", path.file_name().unwrap_or_default(), dest);
                count += 1;
            }
            Err(e) => {
                warn!("Failed to copy {:?} to {:?}: {}", path, dest, e);
            }
        }
    }

    count
}

/// Recursively copy audio samples from source directory into target directory.
fn copy_samples_recursive(source_dir: &Path, target_dir: &Path, base_rel: &Path) -> usize {
    let mut count = 0;
    let Ok(entries) = fs::read_dir(source_dir) else {
        return 0;
    };

    let _ = fs::create_dir_all(target_dir);

    for entry in entries.flatten() {
        let path = entry.path();
        let Some(file_name) = path.file_name() else {
            continue;
        };

        let rel = base_rel.join(file_name);

        if path.is_dir() {
            let next_target = target_dir.join(file_name);
            count += copy_samples_recursive(&path, &next_target, &rel);
        } else if path.is_file() {
            let Some(ext) = path.extension().and_then(|e| e.to_str()) else {
                continue;
            };

            let is_audio = ["wav", "mp3", "ogg", "flac"]
                .iter()
                .any(|e| ext.eq_ignore_ascii_case(e));
            if !is_audio {
                continue;
            }

            if let Ok(meta) = path.metadata() {
                if meta.len() == 0 {
                    continue;
                }
            }

            let dest = target_dir.join(file_name);
            if dest.exists() {
                if let (Ok(meta_src), Ok(meta_dst)) = (path.metadata(), dest.metadata()) {
                    if meta_src.len() == meta_dst.len() {
                        continue;
                    }
                }
            }

            if let Ok(_) = fs::copy(&path, &dest) {
                count += 1;
            }
        }
    }

    count
}

/// Imports all profiles, mic profiles, presets, icons, and samples from official GoXLR sources.
pub async fn import_official_goxlr(
    settings: &SettingsHandle,
    paths: &FilePaths,
    custom_dir: Option<PathBuf>,
) -> Result<ImportSummary> {
    info!("Starting Official TC-Helicon GoXLR Migration...");

    let mut profile_dirs: Vec<PathBuf> = Vec::new();
    let mut mic_dirs: Vec<PathBuf> = Vec::new();
    let mut preset_dirs: Vec<PathBuf> = Vec::new();
    let mut icon_dirs: Vec<PathBuf> = Vec::new();
    let mut sample_dirs: Vec<PathBuf> = Vec::new();

    let mut active_profile: Option<String> = None;
    let mut active_mic_profile: Option<String> = None;

    // 1. If GoXLR.settings exists, parse configured paths
    if let Some(settings_file) = get_official_settings_file() {
        info!("Found official GoXLR.settings at {:?}", settings_file);
        if let Ok(config) = parse_official_settings(&settings_file) {
            if let Some(p) = config.profile_path {
                profile_dirs.push(p);
            }
            if let Some(p) = config.mic_profiles_path {
                mic_dirs.push(p);
            }
            if let Some(p) = config.preset_path {
                preset_dirs.push(p);
            }
            if let Some(p) = config.icon_path {
                icon_dirs.push(p);
            }
            if let Some(p) = config.samples_path {
                sample_dirs.push(p);
            }
            active_profile = config.last_loaded_profile;
            active_mic_profile = config.last_loaded_mic_profile;
        }
    }

    // 2. Add standard known GoXLR base directories (e.g. OneDrive\Documents\GoXLR, Documents\GoXLR)
    for base in get_standard_goxlr_base_dirs() {
        let p = base.join("Profiles");
        if p.exists() && !profile_dirs.contains(&p) {
            profile_dirs.push(p);
        }
        let p = base.join("MicProfiles");
        if p.exists() && !mic_dirs.contains(&p) {
            mic_dirs.push(p);
        }
        let p = base.join("Presets");
        if p.exists() && !preset_dirs.contains(&p) {
            preset_dirs.push(p);
        }
        let p = base.join("Icons");
        if p.exists() && !icon_dirs.contains(&p) {
            icon_dirs.push(p);
        }
        let p = base.join("Samples");
        if p.exists() && !sample_dirs.contains(&p) {
            sample_dirs.push(p);
        }
    }

    // 3. Add custom user directory if specified
    if let Some(custom) = custom_dir {
        if custom.exists() {
            let p = custom.join("Profiles");
            if p.exists() && !profile_dirs.contains(&p) {
                profile_dirs.push(p);
            } else if !profile_dirs.contains(&custom) {
                profile_dirs.push(custom.clone());
            }

            let p = custom.join("MicProfiles");
            if p.exists() && !mic_dirs.contains(&p) {
                mic_dirs.push(p);
            }

            let p = custom.join("Presets");
            if p.exists() && !preset_dirs.contains(&p) {
                preset_dirs.push(p);
            }

            let p = custom.join("Icons");
            if p.exists() && !icon_dirs.contains(&p) {
                icon_dirs.push(p);
            }

            let p = custom.join("Samples");
            if p.exists() && !sample_dirs.contains(&p) {
                sample_dirs.push(p);
            }
        }
    }

    if profile_dirs.is_empty()
        && mic_dirs.is_empty()
        && preset_dirs.is_empty()
        && icon_dirs.is_empty()
        && sample_dirs.is_empty()
    {
        return Err(anyhow!("No official GoXLR directories or files were detected."));
    }

    let mut summary = ImportSummary {
        active_profile,
        active_mic_profile,
        ..Default::default()
    };

    // Filter to ensure we don't copy 0-byte corrupt stub files
    let is_non_empty = |p: &Path| -> bool {
        if let Ok(meta) = p.metadata() {
            meta.len() > 0
        } else {
            false
        }
    };

    // A. Import Profiles (*.goxlr)
    for dir in &profile_dirs {
        summary.profiles += copy_files_with_extensions(
            dir,
            &paths.profiles,
            &paths.backups,
            &["goxlr"],
            is_non_empty,
        );
    }

    // B. Import Mic Profiles (*.goxlrMicProfile)
    for dir in &mic_dirs {
        summary.mic_profiles += copy_files_with_extensions(
            dir,
            &paths.mic_profiles,
            &paths.backups,
            &["goxlrMicProfile"],
            is_non_empty,
        );
    }

    // C. Import Presets (*.preset)
    for dir in &preset_dirs {
        summary.presets += copy_files_with_extensions(
            dir,
            &paths.presets,
            &paths.backups,
            &["preset"],
            is_non_empty,
        );
    }

    // D. Import Icons (*.png, *.jpg, *.jpeg, *.gif)
    for dir in &icon_dirs {
        summary.icons += copy_files_with_extensions(
            dir,
            &paths.icons,
            &paths.backups,
            &["png", "jpg", "jpeg", "gif"],
            is_non_empty,
        );
    }

    // E. Import Samples
    for dir in &sample_dirs {
        summary.samples += copy_samples_recursive(dir, &paths.samples, Path::new(""));
    }

    // F. Persist active profile and mic profile to settings if detected
    let mut updated_settings = false;
    let configured_serials: Vec<String> = settings.get_device_serials().await;

    for serial in &configured_serials {
        if let Some(ref prof) = summary.active_profile {
            let prof_path = paths.profiles.join(format!("{}.goxlr", prof));
            if prof_path.exists() {
                settings.set_device_profile_name(serial, prof).await;
                updated_settings = true;
                info!("Set active profile for device {} to '{}'", serial, prof);
            }
        }

        if let Some(ref mic) = summary.active_mic_profile {
            let mic_path = paths.mic_profiles.join(format!("{}.goxlrMicProfile", mic));
            if mic_path.exists() {
                settings.set_device_mic_profile_name(serial, mic).await;
                updated_settings = true;
                info!("Set active mic profile for device {} to '{}'", serial, mic);
            }
        }
    }

    if updated_settings {
        settings.save().await;
    }

    info!(
        "Migration Complete: {} profiles, {} mic profiles, {} presets, {} icons, {} samples imported",
        summary.profiles, summary.mic_profiles, summary.presets, summary.icons, summary.samples
    );

    Ok(summary)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_official_settings_xml() {
        let sample_xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<PROPERTIES>
  <VALUE name="samplesPath" val="C:\Users\test\OneDrive\Documents\GoXLR\Samples"/>
  <VALUE name="profilePath" val="C:\Users\test\Documents\GoXLR\Profiles"/>
  <VALUE name="micProfilesPath" val="C:\Users\test\Documents\GoXLR\MicProfiles"/>
  <VALUE name="presetPath" val="C:\Users\test\Documents\GoXLR\Presets"/>
  <VALUE name="iconPath" val="C:\Users\test\Documents\GoXLR\Icons"/>
  <VALUE name="LastLoadedMicProfile" val="Default.goxlrMicProfile"/>
  <VALUE name="lastLoadedProfile" val="Tron.goxlr"/>
</PROPERTIES>
"#;

        let temp_dir = std::env::temp_dir();
        let test_file = temp_dir.join("test_goxlr_settings.xml");
        let _ = fs::write(&test_file, sample_xml);

        let config = parse_official_settings(&test_file).expect("Should parse XML successfully");
        let _ = fs::remove_file(&test_file);

        assert_eq!(config.last_loaded_profile, Some("Tron".to_string()));
        assert_eq!(config.last_loaded_mic_profile, Some("Default".to_string()));
    }

    #[test]
    fn test_detection_on_current_system() {
        let detected = is_official_goxlr_detected();
        assert!(detected, "Official GoXLR configuration should be detected on this machine");
    }

    #[test]
    fn test_copy_files_and_backup() {
        let temp_base = std::env::temp_dir().join("novaxlr_test_migration");
        let src = temp_base.join("src");
        let dst = temp_base.join("dst");
        let bkp = temp_base.join("bkp");

        let _ = fs::create_dir_all(&src);
        let _ = fs::create_dir_all(&dst);

        // Write a test profile in src
        let _ = fs::write(src.join("Custom.goxlr"), b"fake profile data 1");
        // Write a corrupted/empty profile in src
        let _ = fs::write(src.join("Corrupt.goxlr"), b"");
        // Write an existing profile in dst
        let _ = fs::write(dst.join("Custom.goxlr"), b"older data");

        let copied = copy_files_with_extensions(
            &src,
            &dst,
            &bkp,
            &["goxlr"],
            |p| p.metadata().map(|m| m.len() > 0).unwrap_or(false),
        );

        assert_eq!(copied, 1, "Should copy exactly 1 valid non-empty file");
        assert!(bkp.join("Custom.goxlr").exists(), "Backup should have been created");
        assert_eq!(fs::read(bkp.join("Custom.goxlr")).unwrap(), b"older data");
        assert_eq!(fs::read(dst.join("Custom.goxlr")).unwrap(), b"fake profile data 1");
        assert!(!dst.join("Corrupt.goxlr").exists(), "Corrupt 0-byte file should not be copied");

        let _ = fs::remove_dir_all(&temp_base);
    }

    #[tokio::test]
    async fn test_import_official_live_integration() {
        let temp_dir = std::env::temp_dir().join("novaxlr_test_live_import");
        let _ = fs::remove_dir_all(&temp_dir);

        let paths = FilePaths {
            profiles: temp_dir.join("profiles"),
            mic_profiles: temp_dir.join("mic-profiles"),
            presets: temp_dir.join("presets"),
            icons: temp_dir.join("icons"),
            samples: temp_dir.join("samples"),
            backups: temp_dir.join("backups"),
        };

        crate::files::FileManager::create_paths(&paths);

        // Load a temporary SettingsHandle
        let settings_path = temp_dir.join("settings.json");
        let settings = SettingsHandle::load(settings_path).await.unwrap();

        let summary = import_official_goxlr(&settings, &paths, None).await.unwrap();

        println!("Import summary: {:?}", summary);
        assert!(summary.profiles > 0, "Should have imported at least one profile");
        assert!(summary.mic_profiles > 0, "Should have imported at least one mic profile");
        assert!(summary.presets > 0, "Should have imported at least one preset");
        assert!(summary.icons > 0, "Should have imported at least one icon");

        // Verify key official files were imported
        assert!(paths.profiles.join("Tron.goxlr").exists(), "Tron.goxlr should exist");
        assert!(paths.profiles.join("Undead.goxlr").exists(), "Undead.goxlr should exist");
        assert!(paths.mic_profiles.join("Default.goxlrMicProfile").exists(), "Default mic profile should exist");

        // Verify active profile was detected from GoXLR.settings
        assert_eq!(summary.active_profile, Some("Tron".to_string()));

        let _ = fs::remove_dir_all(&temp_dir);
    }
}

