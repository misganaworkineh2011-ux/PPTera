# PowerPoint Template Setup Guide

## Overview

The system now uses **template-based PPTX generation** for pixel-perfect exports. This means you design slides in PowerPoint exactly as they should look, and the system fills in the content.

## Quick Start

### Step 1: Install JSZip Dependency

```bash
npm install jszip
npm install --save-dev @types/jszip
```

### Step 2: Create Your First Template

1. **Open PowerPoint**
2. **Create a new presentation** (16:9 aspect ratio)
3. **Design one slide** exactly as it appears on your website
4. **Add placeholders** for dynamic content:
   - Type `{{TITLE}}` where the title should go
   - Type `{{BULLET1}}`, `{{BULLET2}}`, etc. for bullet points
   - Type `{{SLIDE_NUMBER}}` for slide number
   - Type `{{TOTAL_SLIDES}}` for total slides

5. **Save the file** as:
   ```
   templates/pptx/hacker/shell-prompt.pptx
   ```

### Step 3: Test Your Template

1. Export a presentation using the Hacker theme
2. Check that the exported PPTX matches your template design
3. Verify all placeholders were replaced with actual content

## Template Structure

```
templates/pptx/
├── hacker/
│   ├── terminal-window.pptx    ← Create this first
│   ├── shell-prompt.pptx        ← Then this
│   ├── matrix-cards.pptx
│   ├── code-block.pptx
│   ├── cyber-grid.pptx
│   └── hack-split.pptx
├── dark/
│   ├── left-content.pptx
│   ├── image-focus.pptx
│   └── ...
└── [other themes]/
```

## Placeholder Reference

### Text Placeholders
- `{{TITLE}}` - Main slide title
- `{{SUBTITLE}}` - Subtitle (for title slides)
- `{{BULLET1}}` through `{{BULLET10}}` - Bullet point content
- `{{LABEL1}}` through `{{LABEL10}}` - Labels for bullets (if using structured content)
- `{{SLIDE_NUMBER}}` - Current slide number (e.g., "04")
- `{{TOTAL_SLIDES}}` - Total number of slides (e.g., "10")

### Image Placeholders
- `{{IMAGE1}}` - Primary image
- `{{IMAGE2}}`, `{{IMAGE3}}` - Additional images

## Example: Hacker Shell-Prompt Template

### Design Specifications:
```
Background: #0d0d0d (very dark gray)
Border: 2px solid #00ff41 (green), 60% opacity
Scanlines: Repeating horizontal lines, #00ff41, 5% opacity

Header (top-left):
  "04 / 10" - Slide number indicator
  Font: Consolas, 16pt/12pt, #00ff41

Command Prompt:
  "root@kali : ~/slides $ cat README.md"
  Font: Consolas, 12pt
  Colors: #00ff41 (root@kali), #ffffff (:, $), #00d4ff (~/slides), #39ff14 (cat README.md)

Border-Left:
  2px solid #00ff41, 60% opacity
  Left margin: 0.5"

Title:
  "{{TITLE}}"
  Font: Consolas, 36pt, Bold
  Color: #39ff14 (bright green)
  Position: Below command prompt, indented from border

Bullets:
  "→ {{BULLET1}}"
  "→ {{BULLET2}}"
  "→ {{BULLET3}}"
  "→ {{BULLET4}}"
  Arrow: #ffff00 (yellow), 14pt
  Text: Consolas, 14pt, #39ff14
  Spacing: 0.5" between bullets

Bottom Cursor:
  "root@kali : ~/slides $ █"
  Cursor: Green rectangle, 0.15" × 0.2"
```

### PowerPoint Steps:

1. **Set Background**:
   - Right-click slide → Format Background
   - Solid Fill → #0d0d0d

2. **Add Scanlines** (optional):
   - Insert → Shapes → Rectangle
   - Make very thin horizontal lines
   - Set to #00ff41, 5% opacity
   - Duplicate down the slide

3. **Add Border Frame**:
   - Insert → Shapes → Rounded Rectangle
   - Size: 9.2" × 4.6"
   - Position: Center of slide
   - Fill: None
   - Border: 2px, #00ff41, 60% transparency

4. **Add Text Boxes**:
   - Insert → Text Box for each element
   - Use Consolas font
   - Set exact colors from spec
   - Type placeholders like `{{TITLE}}`

5. **Save**:
   - File → Save As
   - Location: `templates/pptx/hacker/shell-prompt.pptx`

## Priority Templates to Create

Start with these most-used layouts:

### Phase 1 (Essential):
1. `hacker/shell-prompt.pptx`
2. `hacker/terminal-window.pptx`
3. `dark/left-content.pptx`
4. `light/centered.pptx`

### Phase 2 (Common):
5. `hacker/matrix-cards.pptx`
6. `hacker/code-block.pptx`
7. `dark/image-focus.pptx`
8. `light/cards-grid.pptx`

### Phase 3 (Complete):
- All remaining layouts for all themes

## Fallback Behavior

If a template doesn't exist:
- System automatically falls back to programmatic generation
- Creates a simple slide with title and bullets
- Uses theme colors and fonts
- Still fully editable
- Won't be pixel-perfect but will work

## Testing Checklist

For each template you create:

- [ ] Slide size is 16:9 (10" × 5.625")
- [ ] All colors match the website exactly
- [ ] Fonts are correct (Consolas for hacker, Arial for corporate, etc.)
- [ ] Placeholders are spelled correctly (case-sensitive!)
- [ ] Text boxes are large enough for varying content lengths
- [ ] Spacing matches the website
- [ ] File is saved in correct folder with correct name
- [ ] Export test shows content is replaced correctly
- [ ] No PowerPoint errors or warnings

## Tips for Success

1. **Use Hex Colors**: Always use exact hex codes from theme definitions
2. **Font Embedding**: If using custom fonts, embed them in the template
3. **Text Box Sizing**: Make text boxes larger than needed to handle long content
4. **Layer Order**: Ensure elements are in correct z-order
5. **No Animations**: Don't add animations or transitions
6. **Test with Real Data**: Export with actual presentation content to test

## Troubleshooting

### Template Not Loading
- Check file path and name exactly match
- Ensure file is valid .pptx format
- Check file permissions

### Placeholders Not Replaced
- Verify placeholder spelling (case-sensitive)
- Check for extra spaces around placeholder
- Ensure placeholder is in a text box, not a shape

### Colors Look Different
- Use exact hex codes
- Check transparency settings
- Ensure RGB color mode, not CMYK

### Layout Breaks with Long Text
- Make text boxes larger
- Enable text wrapping
- Test with maximum expected content length

## Next Steps

1. Create your first template (shell-prompt recommended)
2. Test the export
3. Iterate on design until pixel-perfect
4. Create remaining templates gradually
5. Update templates when web design changes

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify template file exists and is valid
3. Test with fallback generation to isolate template issues
4. Review this guide for common mistakes
