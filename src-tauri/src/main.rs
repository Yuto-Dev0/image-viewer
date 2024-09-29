// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, path};

use tauri::Error;

fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![get_current_dir, get_dir, get_previous_dir])
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}

// Get the list of files in the current directory
#[tauri::command]
fn get_current_dir() -> String {
  return std::env::current_dir().unwrap().to_str().unwrap().to_string();
}
// Get the list of files in the specified path
#[tauri::command]
fn get_dir(path: String) -> Result<Vec<String>, String> {
  if path.is_empty() {
    return Err(("Invalid path").to_string());
  }
  let result = fs::read_dir(path).map_err(|err|err.to_string())?;
  let result = result.map(|x| {
    if x.is_err() {
      return "".to_string();
    }
    x.unwrap().path().to_str().unwrap().to_string()}).collect();
  Ok(result)
}
// Get the list of files in the previous directory
#[tauri::command]
fn get_previous_dir(child_path: String) -> String {
  let designated_path = path::Path::new(&child_path);
  designated_path.parent().unwrap_or(designated_path).display().to_string()
}