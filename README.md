# WhatsApp Video Converter 📱🎥

Convert any video into a WhatsApp-compatible format — fast, simple, and always under 16MB.  
Currently available as a cross-platform **desktop app**, with plans to expand into a **freemium web platform** like FreeConvert.

---

## 🚀 What It Does

- 🎬 Converts videos to `.mp4` with WhatsApp-compliant resolution (max 640x360)
- ⚖️ Keeps original aspect ratio (no stretching or cropping)
- 📉 Compresses video to fit under 16MB
- 🖥 Desktop GUI using Electron + React
- 🔄 Shows live conversion progress

---

## 💻 Tech Stack

- **Electron** – Desktop shell
- **React** – Frontend interface
- **FFmpeg + ffprobe** – Video processing engine
- **Node.js + IPC** – Backend logic

---

## 🛣 Future Plan: Freemium Web App

We’re working on bringing this app to the web:
- ✅ Drag-and-drop video upload
- ✅ Convert directly in-browser or via serverless backend
- 🔒 Account system with free + paid tiers
- 📈 Usage limits for free users (daily converts, file size, etc.)
- 🧩 Additional formats & compression presets

Just like **FreeConvert**, but focused on smooth UX for WhatsApp and mobile messaging formats.

---

## 🧪 Getting Started (Desktop Version)

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally in development
```bash
npm run electron:dev
```

> This will start both React and Electron together.

---

## 🛠 Build for Production

```bash
npm run electron:build
```

Packaged files will appear in the `dist/` folder.

---

## 🗂 Project Structure

```
public/
├── electron.js      # Electron main process logic
├── preload.js       # Secure IPC bridge

src/
├── components/      # React components (FileSelector, ProgressBar, etc.)
├── App.js           # Main React app
├── index.js         # React entry point
```

---

## 📹 WhatsApp Video Requirements

- Must be `.mp4`
- Max file size: **16MB**
- Max resolution: **640x360**
- Aspect ratio must be preserved

---

## 🧠 Author

Made with 💚 by adirs 
Follow updates or contribute: [Your GitHub/Twitter/etc.]

---

## 📬 License

MIT — free to use, modify, and contribute. Commercial SaaS version is coming soon.
