import fs from 'fs/promises'
import path from 'path'

/**
 * Load system prompt from file
 * Prompts are stored in /prompts directory and loaded at runtime
 */
export async function loadPrompt(mode: string): Promise<string> {
  try {
    const promptsDir = process.env.PROMPTS_DIR || path.join(process.cwd(), 'prompts')
    const filePath = path.join(promptsDir, `${mode}.txt`)
    const content = await fs.readFile(filePath, 'utf-8')
    return content.trim()
  } catch (error) {
    console.error(`Failed to load prompt for ${mode}:`, error)
    throw new Error(`Prompt file not found for mode: ${mode}`)
  }
}

/**
 * Save prompt to file (used by admin panel)
 */
export async function savePrompt(mode: string, content: string): Promise<void> {
  try {
    const promptsDir = process.env.PROMPTS_DIR || path.join(process.cwd(), 'prompts')
    const filePath = path.join(promptsDir, `${mode}.txt`)
    await fs.writeFile(filePath, content, 'utf-8')
  } catch (error) {
    console.error(`Failed to save prompt for ${mode}:`, error)
    throw new Error(`Failed to save prompt for mode: ${mode}`)
  }
}

/**
 * List available modes
 */
export async function listModes(): Promise<string[]> {
  try {
    const promptsDir = process.env.PROMPTS_DIR || path.join(process.cwd(), 'prompts')
    const files = await fs.readdir(promptsDir)
    return files
      .filter(file => file.endsWith('.txt'))
      .map(file => file.replace('.txt', ''))
      .sort()
  } catch (error) {
    console.error('Failed to list modes:', error)
    return []
  }
}
