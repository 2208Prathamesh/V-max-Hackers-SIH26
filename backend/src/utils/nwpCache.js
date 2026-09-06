import fs from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const CACHE_DIR = path.join(process.cwd(), '.nwp_cache');

// Ensure cache directory exists
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Get a buffer from the disk cache.
 * @param {string} key - Unique key for the buffer (e.g., date_cycle_step_param)
 * @returns {Promise<Buffer|null>}
 */
export async function getCachedBuffer(key) {
  const filePath = path.join(CACHE_DIR, `${key}.bin`);
  try {
    if (existsSync(filePath)) {
      return await fs.readFile(filePath);
    }
  } catch (error) {
    console.warn(`Error reading from NWP cache for ${key}:`, error.message);
  }
  return null;
}

/**
 * Store a buffer in the disk cache.
 * @param {string} key - Unique key for the buffer
 * @param {Buffer} buffer - The buffer to store
 */
export async function setCachedBuffer(key, buffer) {
  const filePath = path.join(CACHE_DIR, `${key}.bin`);
  try {
    await fs.writeFile(filePath, buffer);
  } catch (error) {
    console.warn(`Error writing to NWP cache for ${key}:`, error.message);
  }
}

/**
 * Clear a specific cached buffer.
 * @param {string} key
 */
export async function deleteCachedBuffer(key) {
  const filePath = path.join(CACHE_DIR, `${key}.bin`);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore if file doesn't exist
  }
}

/**
 * Clear all cached buffers.
 */
export async function clearNwpCache() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    await Promise.all(files.map(file => fs.unlink(path.join(CACHE_DIR, file))));
  } catch (error) {
    console.warn(`Error clearing NWP cache:`, error.message);
  }
}
