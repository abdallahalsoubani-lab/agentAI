# System Prompts

This directory contains the system prompts for each of the 4 modes.

## Files

- `mode1.txt` - Saudi Najdi Banking Assistant (Amjad)
- `mode2.txt` - Jordanian Amman Banking Assistant (Amjad)
- `mode3.txt` - Saudi Healthcare Assistant (Noura)
- `mode4.txt` - Jordanian Coffee Ordering Assistant (Salma/Alameed)

## Usage

The application loads these prompts at runtime. Edit these files to customize the assistant behavior for each mode.

## Important Notes

1. **Do NOT hardcode prompts** in the application code
2. Prompts are loaded from this directory at runtime
3. The current files contain PLACEHOLDERS only
4. Replace with your actual system prompts before deployment
5. For Mode 4 (Alameed), ensure JSON action protocol is clearly defined

## Editing Prompts

You can edit prompts:
- Directly in these files (requires file system access)
- Via the Admin Panel (embedded in Alameed page, accessible with admin password)

## Prompt Revisions

The admin panel tracks prompt history. Each edit creates a new revision in the database.
