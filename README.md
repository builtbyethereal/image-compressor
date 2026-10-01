<div align="center">

# 🛠️ Image Toolkit

**A fast, private, all-in-one image editor that runs entirely in your browser.**

Compress · Resize · Convert · Crop · Generate Favicons

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Demo](#-demo)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [How to Use](#-how-to-use)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Browser Support](#-browser-support)
- [Privacy](#-privacy)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 📌 About

**Image Toolkit** is a lightweight, zero-dependency web application that lets you **compress, resize, convert, crop, and generate favicons** for images — all without uploading anything to a server.

Every operation is performed **client-side** using the HTML5 Canvas API and the File API, so your images never leave your device. Perfect for designers, developers, and anyone who needs quick image processing without installing software.

> 💡 **Why this project?** Most online image tools upload your files to their servers. This one doesn't. It's fast, private, and works offline after the first load.

---

## ✨ Features

### 🗜️ Image Compressor
- Reduce file size with adjustable quality (10%–100%)
- Output formats: **JPEG, PNG, WEBP, AVIF**
- Live size comparison and savings percentage

### 📐 Image Resizer
- Resize by width or height (auto-calculates the other)
- Optional aspect ratio lock
- **Preserves original format automatically** (with PNG fallback for unsupported types)
- No format confusion — just resize and download

### 🔄 Format Converter
- Convert between **PNG, JPEG, WEBP, and AVIF**
- Quality slider for lossy formats
- Side-by-side preview of original vs. converted

### ✂️ Image Cropper
- Interactive drag-to-crop with 8 resize handles
- Manual X / Y / Width / Height input fields
- Real-time selection overlay
- Output format selector

### ⭐ Favicon Generator
- Create **multi-resolution `.ico` files** (16, 32, 48, 64, 128, 256 px)
- Choose **8-bit (256 colors)** or **32-bit (16.7M colors + alpha)**
- Optional **pad-to-square with transparency** — preserves aspect ratio
- Live preview at every selected size
- Generates a **real, valid ICO file** (proper header, directory, and PNG payload)

### 🎨 UI / UX
- Modern glassmorphic design
- Full **black & white dark theme**
- Fully responsive (mobile-friendly)
- Drag & drop or click-to-browse upload
- Live previews and file size comparisons
- Zero external libraries

---

## 🚀 Demo

> **Live Demo:** [https://yourdomain.com](https://yourdomain.com) *(replace with your deployed URL)*

---

## 📸 Screenshots

> Add your screenshots here. Recommended: 1280×800 PNG files in a `/screenshots` folder.

| Compress | Resize |
|---|---|
| ![Compress](screenshots/compress.png) | ![Resize](screenshots/resize.png) |

| Convert | Crop |
|---|---|
| ![Convert](screenshots/convert.png) | ![Crop](screenshots/crop.png) |

| Favicon Generator |
|---|
| ![Favicon](screenshots/favicon.png) |

---

## 🏁 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- No build tools required — it's plain HTML/CSS/JS

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/image-toolkit.git
cd image-toolkit
