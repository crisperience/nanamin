# 📚 Nanamin

**Fast, privacy-first comic & manga compression in your browser.**

Compress your CBZ and CBR files by 30-70% while maintaining visual quality. Everything happens locally in your browser - your files never leave your device.

## ✨ Features

- 🔒 **100% Private** - Files never leave your browser
- 🎯 **Smart Compression** - Adjustable quality settings (30-100%)
- 📱 **Modern UI** - Clean, responsive design with Mantine components
- 🌙 **Dark Theme** - Easy on the eyes for long sessions
- 📊 **Real-time Stats** - See compression results instantly
- 📈 **Analytics** - Vercel Analytics for usage insights
- 🔍 **SEO Optimized** - Enhanced metadata and social sharing
- 📁 **Large File Support** - Up to 1GB per file

## 🚀 Tech Stack

- **Framework**: Next.js 15 + TypeScript
- **UI Library**: Mantine + Tabler Icons
- **Compression**: browser-image-compression + JSZip
- **Styling**: Modern CSS-in-JS with Mantine
- **Deployment**: Vercel-optimized

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check
```

## 📦 Deployment

The project is optimized for Vercel deployment:

```bash
# Deploy to Vercel
vercel

# Or build locally
pnpm build
pnpm start
```

## 🎯 How It Works

1. **Drop Files**: Drag & drop your CBZ/CBR files
2. **Adjust Quality**: Use the slider to set compression level
3. **Process**: Click compress and watch the magic happen
4. **Download**: Get your compressed files instantly

## 🔧 Configuration

- **Quality Settings**: 30% (max compression) to 100% (minimal compression)
- **Supported Formats**: CBZ, CBR input files
- **Output Format**: CBZ with WebP images
- **File Size Limit**: 1GB per file (browser dependent)
- **File Count Limit**: Maximum 50 files per batch
- **Total Processing**: Depends on device memory (typically 10-20GB total)
- **Enhanced UX**: Quality controls and compress button hide after completion
- **Better Error Handling**: Clear feedback for oversized files and limits
- **Mobile Optimized**: Responsive design for all screen sizes

## License

MIT
