# Jerry - AI Chat Interface

Jerry is a modern, responsive AI chat application built with React, Vite, and Firebase. It features a sleek dark UI, real-time message streaming, and a smooth mobile experience.

## 🚀 Features

- **Real-time Streaming**: AI responses stream in real-time for a natural chat experience.
- **Thinking Animation**: Visual feedback while the AI processes your request.
- **Mobile Optimized**: Responsive design with a slide-out sidebar and touch-friendly inputs.
- **Secure Auth**: Firebase Authentication for user accounts.
- **Markdown Support**: Rich text formatting, including code highlighting and copy-to-clipboard.
- **Multi-Environment**: Dedicated configurations for development and production.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4
- **Authentication**: Firebase Auth
- **Icons**: React Icons (Fi, Io5)
- **Content**: React Markdown, Remark GFM, Rehype Highlight

---

## 💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/tejasM17/jerry
cd jerry
```

### 2. Environment Setup

Create a `.env.development` file in the root directory and add your Firebase credentials. You can use `.env.example` as a template.

```bash
# Example .env.development
VITE_API_BASE_URL=http://localhost:5000/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔗 Backend

This frontend requires the Jerry API to function:
[https://github.com/tejasM17/jerry-api](https://github.com/tejasM17/jerry-api)

## ⌨️ Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line

---

*Jerry can make mistakes. Verify important information.*
