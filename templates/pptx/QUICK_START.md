# Quick Start: Create Your First Template

## What You Need
- Microsoft PowerPoint (or compatible software)
- 15-30 minutes
- Your website open for reference

## Step-by-Step: Hacker Theme Shell-Prompt Template

### 1. Open PowerPoint
- Create a new blank presentation
- Go to Design → Slide Size → Custom Slide Size
- Set to: **Width: 10"**, **Height: 5.625"** (16:9 ratio)

### 2. Set Background
- Right-click slide → Format Background
- Solid Fill → Color: **#0d0d0d** (very dark gray)
- Click "Apply to All"

### 3. Add Terminal Border
- Insert → Shapes → Rounded Rectangle
- Size: **9.2" wide × 4.6" tall**
- Position: Center of slide
- Right-click → Format Shape:
  - Fill: No Fill
  - Line: Solid Line
  - Color: **#00ff41** (green)
  - Width: **2pt**
  - Transparency: **40%**

### 4. Add Slide Number (Top-Left)
- Insert → Text Box
- Position: **0.3" from left, 0.3" from top**
- Type: `{{SLIDE_NUMBER}} / {{TOTAL_SLIDES}}`
- Font: **Consolas, 14pt**
- Color: **#00ff41**

### 5. Add Command Prompt Header
- Insert → Text Box
- Position: **0.8" from left, 0.8" from top**
- Type: `root@kali : ~/slides $ cat slide_{{SLIDE_NUMBER}}.txt`
- Font: **Consolas, 12pt**
- Format the text:
  - `root@kali` → **#00ff41** (green)
  - `:` → **#ffffff** (white)
  - `~/slides` → **#00d4ff** (cyan)
  - `$` → **#ffffff** (white)
  - `cat slide_{{SLIDE_NUMBER}}.txt` → **#39ff14** (bright green)

### 6. Add Title
- Insert → Text Box
- Position: **0.8" from left, 1.5" from top**
- Size: **8" wide × 1" tall**
- Type: `{{TITLE}}`
- Font: **Consolas, 32pt, Bold**
- Color: **#39ff14** (bright green)

### 7. Add Bullet Points
- Insert → Text Box for each bullet
- Position: Start at **0.8" from left, 2.5" from top**
- Spacing: **0.4" between each bullet**
- Format each as:
  ```
  → {{BULLET1}}
  → {{BULLET2}}
  → {{BULLET3}}
  → {{BULLET4}}
  ```
- Arrow: **#ffff00** (yellow), 14pt
- Text: **Consolas, 14pt**, **#39ff14** (bright green)

### 8. Add Bottom Cursor
- Insert → Text Box
- Position: **0.8" from left, 4.8" from bottom**
- Type: `root@kali : ~/slides $ █`
- Font: **Consolas, 12pt**
- Color: **#00ff41**
- The █ is a cursor block (Alt+219 on Windows)

### 9. Save Template
- File → Save As
- Navigate to: `templates/pptx/hacker/`
- Filename: `shell-prompt.pptx`
- Format: **PowerPoint Presentation (.pptx)**
- Click Save

### 10. Test Your Template
1. Go to your website
2. Create a presentation with Hacker theme
3. Add some content to slides
4. Export as PPTX
5. Open the exported file
6. Verify:
   - ✅ Placeholders are replaced with actual content
   - ✅ Colors match your website exactly
   - ✅ Fonts are correct
   - ✅ Layout matches web design
   - ✅ All text is editable

## Common Issues

### Placeholders Not Replaced
- **Problem**: You see `{{TITLE}}` in the exported file
- **Solution**: Check spelling (case-sensitive), ensure double curly braces

### Colors Look Different
- **Problem**: Colors don't match website
- **Solution**: Use exact hex codes, check RGB mode (not CMYK)

### Text Gets Cut Off
- **Problem**: Long text is truncated
- **Solution**: Make text boxes larger, enable text wrapping

### Template Not Found
- **Problem**: Export fails with "template not found"
- **Solution**: Check file path and name exactly match

## Next Templates to Create

After shell-prompt, create these in order:

1. **hacker/terminal-window.pptx** - Similar to shell-prompt but with window frame
2. **hacker/matrix-cards.pptx** - Card-based layout with matrix effect
3. **dark/left-content.pptx** - Simple left-aligned content
4. **light/centered.pptx** - Centered content for light theme

## Tips for Success

- **Copy Colors**: Use the color picker to copy exact colors from your website
- **Test Early**: Export after creating each template to catch issues
- **Keep It Simple**: Start with basic layouts, add complexity later
- **Use Guides**: PowerPoint's ruler and guides help with alignment
- **Save Often**: PowerPoint can crash, save frequently

## Need Help?

- Check `TEMPLATE_SETUP_GUIDE.md` for detailed instructions
- Review `README.md` for placeholder reference
- Look at console logs when exporting for error messages

## Congratulations!

Once you've created your first template, you'll see how easy it is to create pixel-perfect exports. Each template takes about 15-30 minutes to create, and you can do them one at a time as needed.
