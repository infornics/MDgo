# MDgo 🚀

**MDgo** is a premium, high-performance Markdown editor and document-sharing platform designed for speed, beauty, and professional documentation workflows.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://img.shields.io/badge/Open%20Source-Heart-red)](https://github.com/infornics/MDgo)

---

## ✨ Key Features

- **🎨 Premium Metallic Theme**: A stunning, high-contrast dark mode tailored for deep focus and visual excellence.
- **⚡ Real-time Rendering**: Zero-latency markdown preview as you type, powered by a highly optimized rendering engine.
- **🛡️ Granular Sharing**: Control your document permissions with public links, read-only modes, and full collaborator management.
- **📄 High-Fidelity PDF Export**: Professional, lightweight PDF generation that perfectly matches your preview styling.
- **☁️ Cloud Sync**: Seamlessly save and access your documents from anywhere with secure cloud storage.
- **📂 File Browser**: Organize your workflow with an integrated, intuitive file management system.

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** (App Router)
- **Tailwind CSS** (Custom Metallic Theme)
- **Shadcn UI** (Components)
- **jsPDF & html2canvas** (Optimized PDF Export)
- **Monaco Editor** / **Custom Code Editors**

### Backend

- **Node.js & Express**
- **MongoDB & Mongoose**
- **JWT Authentication**

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### Local Development Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/infornics/MDgo.git
   cd MDgo
   ```

2. **Configure Backend:**

   ```bash
   cd backend
   npm install
   # Create a .env file based on example.env
   npm run dev
   ```

3. **Configure Frontend (Website):**

   ```bash
   cd ../website
   npm install
   # Create a .env.local file with NEXT_PUBLIC_API_URL=http://localhost:5000/api
   npm run dev
   ```

4. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000) for the landing page or [http://localhost:3000/doc](http://localhost:3000/doc) for the editor.

---

## 🤝 Contribution

MDgo is an **Open Source Project from Infornics**. We welcome contributions from the community! Whether it's a bug fix, a new feature, or a design improvement, feel free to open an issue or submit a pull request.

1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Handcrafted with ❤️ by **[Infornics](https://github.com/infornics)**.
