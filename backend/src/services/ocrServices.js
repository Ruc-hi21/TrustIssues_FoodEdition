// ============================================================
// ocrService.js — Tesseract.js OCR pipeline for IngredientSafe
// Preprocessing via Sharp: greyscale → normalise → sharpen → upscale
// Supports: base64 (camera) and file path (gallery upload)
// ============================================================

import Tesseract from "tesseract.js";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import os from "os";

async function preprocessImage(inputPath) {
  const outputPath = path.join(os.tmpdir(), `ocr_pre_${Date.now()}.png`);
  await sharp(inputPath)
    .greyscale()
    .normalise()
    .sharpen({ sigma: 1.5 })
    .resize({ width: 1400, withoutEnlargement: false })
    .png()
    .toFile(outputPath);
  return outputPath;
}

async function runTesseract(imagePath) {
  try {
    const { data } = await Tesseract.recognize(imagePath, "eng", {
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
    });

    const rawText = data.text.trim();
    const words = data.words || [];
    const avgConfidence =
      words.length > 0
        ? words.reduce((sum, w) => sum + (w.confidence || 0), 0) / words.length
        : data.confidence;

    if (!rawText || rawText.length < 10) {
      return {
        success: false,
        rawText: "",
        confidence: 0,
        wordCount: 0,
        error: "OCR returned no usable text. Image may be too blurry or low resolution.",
      };
    }

    return {
      success: true,
      rawText,
      confidence: Math.round(avgConfidence),
      wordCount: words.length,
    };
  } catch (err) {
    return {
      success: false,
      rawText: "",
      confidence: 0,
      wordCount: 0,
      error: `Tesseract error: ${err.message}`,
    };
  }
}

export async function ocrFromFile(filePath) {
  let preprocessedPath = null;
  try {
    preprocessedPath = await preprocessImage(filePath);
    return await runTesseract(preprocessedPath);
  } catch (err) {
    return {
      success: false,
      rawText: "",
      confidence: 0,
      wordCount: 0,
      error: `Image preprocessing failed: ${err.message}`,
    };
  } finally {
    if (preprocessedPath && fs.existsSync(preprocessedPath)) {
      fs.unlinkSync(preprocessedPath);
    }
  }
}

export async function ocrFromBase64(base64) {
  let rawPath = null;
  let preprocessedPath = null;
  try {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    rawPath = path.join(os.tmpdir(), `ocr_raw_${Date.now()}.jpg`);
    fs.writeFileSync(rawPath, Buffer.from(base64Data, "base64"));
    preprocessedPath = await preprocessImage(rawPath);
    return await runTesseract(preprocessedPath);
  } catch (err) {
    return {
      success: false,
      rawText: "",
      confidence: 0,
      wordCount: 0,
      error: `Base64 OCR failed: ${err.message}`,
    };
  } finally {
    if (rawPath && fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
    if (preprocessedPath && fs.existsSync(preprocessedPath)) fs.unlinkSync(preprocessedPath);
  }
}