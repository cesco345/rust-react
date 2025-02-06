use wasm_bindgen::prelude::*;
use image::{DynamicImage, ImageBuffer, Rgba};
use base64::{Engine as _, engine::general_purpose};

#[wasm_bindgen]
pub fn process_image(base64_input: &str, filter_type: u32, intensity: f32) -> String {
    // how to decode base64
    let bytes = match general_purpose::STANDARD.decode(base64_input) {
        Ok(b) => b,
        Err(_) => return String::from(""),
    };

    // to load image from bytes
    let img = match image::load_from_memory(&bytes) {
        Ok(img) => img,
        Err(_) => return String::from(""),
    };

    // whatever filter we want to apply
    let processed = match filter_type {
        0 => img.grayscale(),
        1 => img.blur(intensity),
        2 => adjust_brightness(&img, intensity),
        _ => img,
    };

    // convert image back to bytes
    let mut output_bytes: Vec = Vec::new();
    if processed
        .write_to(&mut output_bytes, image::ImageOutputFormat::Png)
        .is_err()
    {
        return String::from("");
    }

    general_purpose::STANDARD.encode(&output_bytes)
}

fn adjust_brightness(img: &DynamicImage, factor: f32) -> DynamicImage {
    img.brighten((factor * 100.0) as i32)
}