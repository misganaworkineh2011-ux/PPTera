# Verify Template System Setup

Use this checklist to verify your template system is ready to use.

## ✅ Setup Verification

### 1. Dependencies Installed
Run this command to check:
```bash
npm list jszip
```

**Expected Output**: Should show jszip version (e.g., `jszip@3.10.1`)

**If Not Installed**:
```bash
npm install jszip
npm install --save-dev @types/jszip
```

### 2. Directory Structure Created
Check that these folders exist:
```
templates/pptx/
├── hacker/
├── dark/
├── light/
├── cyber/
├── corporate/
├── sunset/
├── ocean/
├── aurora/
├── ember/
├── midnight/
├── alien/
├── architectural/
├── cosmic/
└── anime/
```

**Verify**: Run `dir templates\pptx` (Windows) or `ls templates/pptx` (Mac/Linux)

### 3. Code Files Updated
Check these files exist and are correct:

- [ ] `src/lib/export/pptx-template-engine.ts` - Template engine exists
- [ ] `src/app/api/presentations/[id]/export/route.ts` - Uses template system
- [ ] `src/lib/export/pptx-generator.ts` - Should NOT exist (removed)
- [ ] `src/lib/export/template-pptx-generator.ts` - Should NOT exist (removed)

### 4. Documentation Files
Check these files exist:

- [ ] `templates/pptx/README.md` - Template system overview
- [ ] `templates/pptx/QUICK_START.md` - Step-by-step guide
- [ ] `templates/pptx/TEMPLATE_CHECKLIST.md` - Progress tracking
- [ ] `templates/pptx/VERIFY_SETUP.md` - This file
- [ ] `TEMPLATE_SETUP_GUIDE.md` - Detailed setup guide
- [ ] `EXPORT_SYSTEM_SUMMARY.md` - System overview

## 🎯 Next Steps

### Step 1: Create Your First Template
Follow `QUICK_START.md` to create `hacker/shell-prompt.pptx`

**Time Required**: 15-30 minutes

**What You'll Do**:
1. Open PowerPoint
2. Design the slide to match your website
3. Add placeholders like `{{TITLE}}`, `{{BULLET1}}`
4. Save as `templates/pptx/hacker/shell-prompt.pptx`

### Step 2: Test the Template
1. Go to your website
2. Create a presentation with Hacker theme
3. Add content to slides
4. Click Export → PPTX
5. Open the exported file
6. Verify it matches your template design

### Step 3: Create More Templates
Use `TEMPLATE_CHECKLIST.md` to track your progress:
- Start with Phase 1 (Essential) templates
- Then Phase 2 (Common) templates
- Finally Phase 3 (Additional) templates

## 🔍 Troubleshooting

### Export Fails with "Template not found"
**Problem**: Template doesn't exist yet
**Solution**: Create the template following QUICK_START.md
**Note**: This is expected until you create templates

### TypeScript Errors
**Problem**: JSZip types not found
**Solution**: Run `npm install --save-dev @types/jszip`

### Import Errors
**Problem**: Can't import from pptx-generator
**Solution**: Old file should be deleted, check it doesn't exist

### Template Not Loading
**Problem**: Template exists but not loading
**Solution**: 
- Check file path exactly matches
- Verify file is valid .pptx format
- Check file permissions

## 📊 System Status

**Current Status**: ✅ Ready to Create Templates

**What's Working**:
- ✅ JSZip dependency installed
- ✅ Template directories created
- ✅ Template engine implemented
- ✅ Export route updated
- ✅ Old code removed
- ✅ Documentation complete

**What's Needed**:
- ⏳ Create template files (.pptx)
- ⏳ Test each template
- ⏳ Verify pixel-perfect exports

## 🎨 Template Creation Priority

Create templates in this order for best results:

**Week 1**: Essential Templates (4 templates)
1. `hacker/shell-prompt.pptx` ← Start here
2. `hacker/terminal-window.pptx`
3. `dark/left-content.pptx`
4. `light/centered.pptx`

**Week 2**: Common Templates (6 templates)
5. `hacker/matrix-cards.pptx`
6. `hacker/code-block.pptx`
7. `dark/image-focus.pptx`
8. `dark/right-content.pptx`
9. `light/cards-grid.pptx`
10. `light/left-content.pptx`

**Week 3+**: Remaining Templates (74 templates)
- Create as needed based on usage
- Can be done gradually over time

## 💡 Tips for Success

1. **Start Small**: Create one template, test it, then move to next
2. **Use Website**: Keep your website open for reference
3. **Test Early**: Export after each template to catch issues
4. **Document**: Note any design decisions or challenges
5. **Be Patient**: Each template takes 15-30 minutes
6. **Stay Consistent**: Use exact colors and fonts from website

## 📞 Need Help?

If you encounter issues:

1. **Check Documentation**:
   - `QUICK_START.md` - Step-by-step instructions
   - `TEMPLATE_SETUP_GUIDE.md` - Detailed guide
   - `README.md` - System overview

2. **Check Console Logs**:
   - Look for error messages when exporting
   - Check browser console for details

3. **Verify Setup**:
   - Run through this checklist again
   - Ensure all files are in place

4. **Test Template**:
   - Open template in PowerPoint
   - Verify it's a valid .pptx file
   - Check placeholders are spelled correctly

## ✨ You're Ready!

Your template system is set up and ready to use. Follow QUICK_START.md to create your first template and start generating pixel-perfect PPTX exports!

**Remember**: The system requires templates to work. Start with one template, test it, then expand gradually. You've got this! 🚀
