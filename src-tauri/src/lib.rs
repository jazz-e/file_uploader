use std::fs;
use std::path::Path;

use tauri::{AppHandle, Manager};

#[tauri::command]
fn upload_file(app: AppHandle, source_path: String) -> Result<String, String> {
    // Extract the filename from the source path.
    let file_name = Path::new(&source_path)
        .file_name()
        .ok_or("Invalid file name")?;

    // Get the application data directory.
    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;

    // Create the uploads directory.
    let upload_dir = app_data.join("uploads");

    fs::create_dir_all(&upload_dir).map_err(|e| e.to_string())?;

    // Construct the destination path.
    let destination = upload_dir.join(file_name);

    // Copy the source file.
    fs::copy(&source_path, &destination).map_err(|e| e.to_string())?;

    // Return the destination path to React.
    Ok(destination.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Register the native file dialog plugin.
        .plugin(tauri_plugin_dialog::init())
        // Register commands that React can call.
        .invoke_handler(tauri::generate_handler![upload_file])
        // Start the Tauri application.
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
