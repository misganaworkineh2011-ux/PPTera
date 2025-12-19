# PowerPoint Template System

This directory contains pre-designed PowerPoint templates for pixel-perfect exports.

## Directory Structure

```
templates/pptx/
├── hacker/
│   ├── terminal-window.pptx
│   ├── matrix-cards.pptx
│   ├── code-block.pptx
│   ├── shell-prompt.pptx
│   ├── cyber-grid.pptx
│   └── hack-split.pptx
├── cyber/
│   ├── glitch-frame.pptx
│   ├── neon-grid.pptx
│   └── holo-cards.pptx
├── dark/
│   ├── left-content.pptx
│   ├── image-focus.pptx
│   └── ...
└── [other themes]/
```

## Creating Templates

### Step 1: Design in PowerPoint

1. Open PowerPoint
2. Set slide size to **16:9** (10" × 5.625")
3. Design your slide exactly as it appears on the website
4. Use the exact colors, fonts, and positioning from your theme

### Step 2: Add Placeholders

Use these placeholder texts in your template (they will be replaced with actual content):

- `{{TITLE}}` - Slide title
- `{{SUBTITLE}}` - Slide subtitle (for title slides)
- `{{BULLET1}}`, `{{BULLET2}}`, `{{BULLET3}}`, etc. - Bullet points
- `{{LABEL1}}`, `{{LABEL2}}`, etc. - Labels for bullet points
- `{{SLIDE_NUMBER}}` - Current slide number (e.g., "04")
- `{{TOTAL_SLIDES}}` - Total number of slides (e.g., "10")
- `{{IMAGE1}}` - Image placeholder (use a placeholder image)

### Step 3: Save Template

1. Save the file as `.pptx` format
2. Name it exactly as the layout name (e.g., `terminal-window.pptx`)
3. Place it in the correct theme folder

## Example: Hacker Terminal Window Template

### Design Elements:
- **Background**: Dark (#0d0d0d) with scanline effect
- **Terminal Frame**: Rounded rectangle with green border (#00ff41)
- **Header Bar**: Dark gray (#141414) with traffic light dots
- **Traffic Lights**: Red (#FF5F56), Yellow (#FFBD2E), Green (#27CA40)
- **Title**: Bright green (#39ff14), Consolas font, 32pt
- **Bullets**: Format as `[0]`, `[1]`, `[2]` in muted green
- **Cursor**: Green rectangle at bottom

### Placeholder Positions:
```
Slide Number: Top-left ({{SLIDE_NUMBER}} / {{TOTAL_SLIDES}})
Terminal Header: root@kali:~# ./presentation --slide {{SLIDE_NUMBER}}
Command: $ cat slide_{{SLIDE_NUMBER}}.txt
Title: {{TITLE}}
Bullets: [0] {{BULLET1}}
         [1] {{BULLET2}}
         [2] {{BULLET3}}
         [3] {{BULLET4}}
```

## Theme-Specific Guidelines

### Hacker Theme
- **Font**: Consolas (monospace)
- **Primary Color**: #00ff41 (green)
- **Text Color**: #39ff14 (bright green)
- **Background**: #0d0d0d (very dark)
- **Effects**: Scanlines, terminal aesthetics

### Cyber Theme
- **Font**: Consolas
- **Primary Colors**: #22D3EE (cyan), #D946EF (magenta)
- **Effects**: Neon glow, grid patterns

### Corporate Theme
- **Font**: Arial
- **Primary Color**: #3B82F6 (blue)
- **Style**: Clean, professional, minimal

## Quick Start

### Option 1: Create One Template at a Time

Start with the most used layout for each theme:
1. **Hacker**: `shell-prompt.pptx`
2. **Dark**: `left-content.pptx`
3. **Light**: `centered.pptx`

### Option 2: Use Fallback

If a template doesn't exist, the system will use a simple fallback layout.

## Testing Your Templates

1. Place your template in the correct folder
2. Export a presentation using that theme
3. Check that:
   - All placeholders are replaced
   - Colors match the website
   - Fonts are correct
   - Spacing is accurate
   - Images appear in the right place

## Tips for Best Results

1. **Use Text Boxes**: Don't use PowerPoint's default title/content placeholders
2. **Exact Colors**: Use the hex codes from the theme definitions
3. **Font Embedding**: Embed fonts in the template if using custom fonts
4. **Test with Long Text**: Make sure text boxes can handle varying content lengths
5. **Image Placeholders**: Use a colored rectangle as image placeholder
6. **Consistent Sizing**: Keep all templates at 16:9 ratio

## Maintenance

When updating designs:
1. Update the web version first
2. Update the corresponding template
3. Test the export
4. Commit both changes together

## Required Templates

All templates must be created before exporting:
- Export will fail if template doesn't exist
- This ensures pixel-perfect results
- Use QUICK_START.md to create your first template
- Track progress with TEMPLATE_CHECKLIST.md

## Future Enhancements

- [ ] Automated template generation from web screenshots
- [ ] Template validation tool
- [ ] Bulk template creator
- [ ] Template preview in admin panel
