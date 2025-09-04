# MMEditor Distribution Guide

## 📦 For Internal Team Distribution

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd MMEditor
   git checkout v1.0.0-internal
   ```

2. **Install and build**:
   ```bash
   npm install
   npm run build
   ```

3. **Use in your project**:

   **Option A: NPM Link (for local development)**
   ```bash
   # In MMEditor directory
   npm link
   
   # In your project
   npm link @mmeditor/core
   ```

   **Option B: Direct file reference**
   ```json
   // In your project's package.json
   "dependencies": {
     "@mmeditor/core": "file:../path/to/MMEditor"
   }
   ```

   **Option C: Using the built files directly**
   ```bash
   # Copy dist folder to your project
   cp -r dist/ your-project/vendor/mmeditor/
   ```

### Using Pre-built Files

The `dist/` folder contains:
- `mmeditor.es.js` - ESM build (recommended)
- `mmeditor.umd.js` - UMD build for script tags
- `core.css` - Required styles
- `*.d.ts` - TypeScript definitions

### Integration Example

```tsx
// ESM Import
import { MMEditor } from '@mmeditor/core';
import '@mmeditor/core/dist/core.css';

// Or using CDN/script tags
<script src="path/to/mmeditor.umd.js"></script>
<link rel="stylesheet" href="path/to/core.css">
```

## 🚀 Deployment Options

### 1. Private NPM Registry
If your team has a private NPM registry:
```bash
npm publish --registry=https://your-registry.com
```

### 2. GitHub Packages
```bash
npm publish --registry=https://npm.pkg.github.com
```

### 3. Direct GitHub Installation
Teams can install directly from GitHub:
```bash
npm install git+https://github.com/yourorg/MMEditor.git#v1.0.0-internal
```

### 4. Manual Distribution
The release artifacts can be distributed as a zip file containing:
- `dist/` - Built files
- `package.json` - Package metadata
- `README.md` - Documentation
- `CHANGELOG.md` - Change history

## 📋 Checklist for Team Integration

- [ ] Install the package using preferred method
- [ ] Import CSS file (`core.css`)
- [ ] Add MMEditor component to your React app
- [ ] Configure any needed plugins
- [ ] Test in your target browsers (Chrome, Safari)
- [ ] Verify TypeScript types are working
- [ ] Check bundle size impact

## 🔧 Configuration

### Environment Variables
No environment variables required.

### Build Configuration
If you need custom builds:
```bash
# Development build
npm run dev

# Production build
npm run build

# Watch mode
npm run build -- --watch
```

## 📊 Bundle Sizes

| Format | Size | Gzipped |
|--------|------|---------|
| ESM | 76.69 KB | 19.34 KB |
| UMD | 50.33 KB | 15.46 KB |
| CSS | 10.65 KB | 2.42 KB |

## 🆘 Troubleshooting

### TypeScript Issues
Ensure `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

### CSS Not Loading
Make sure to import the CSS file:
```tsx
import '@mmeditor/core/dist/core.css';
```

### React Version Conflicts
Requires React 18+. Check your version:
```bash
npm list react
```

## 📞 Support

For internal support:
- Check the [documentation](./docs/)
- Review the [demo application](./demo/)
- Contact the development team

## 🔒 Security Note

This is an internal release. Do not distribute outside the organization.