# Jerry - AI Chat Interface (Instructions)
if any new feature added to project. keep updated the readme.md and gemini.md 

This document provides foundational mandates, architectural patterns, and the current status of the Jerry project. Rigorously adhere to these guidelines during development.

## 🎯 Project Overview
Jerry is a modern, responsive AI chat application built with **React 19**, **Vite**, and **Tailwind CSS 4**. It features real-time message streaming, Firebase-backed authentication, and a sleek premium dark-themed UI inspired by industry leaders like ChatGPT and Gemini.

## 🛠️ Tech Stack & Patterns
- **Framework**: React 19 (Functional Components, Hooks).
- **Styling**: Tailwind CSS 4 (Preferred). Maintain the "Modern/Alive" dark aesthetic using the `zinc` palette.
- **Animations**: Framer Motion for smooth transitions and interactive elements.
- **Routing**: `react-router-dom` (v7+).
- **State & Logic**: Feature-based architecture located in `src/features/`.
- **Authentication**: Firebase Authentication.
- **API**: Streaming fetch requests to a dedicated backend (default: `http://localhost:5000/api`).

## 🏗️ Architecture & Conventions
1.  **Feature-Based Folders**: Group components, hooks, and logic related to a specific feature (e.g., `auth`, `chat`) within `src/features/`.
2.  **API Requests**: Always use the `API_BASE` constant from `src/api/base.js`. Ensure requests include the Firebase Bearer token in the `Authorization` header.
3.  **UI Components**: Prioritize accessibility and responsive design. Use `react-icons` and `framer-motion` for consistency.
4.  **Chat Logic**: The `useChat` hook handles streaming, state management for messages, and interaction with the backend.

## 📍 Current Status
- **Auth**: Login and Registration flows are implemented via `AuthProvider.jsx`.
- **Chat**: Premium UI with dark streaming bubbles (`bg-zinc-900` for user), auto-expanding pill-shaped input bar (`bg-zinc-800`), and a glassmorphic attachment drop-up menu.
- **UI/UX**: Modern dropup profile menu and attachment menu with smooth animations. Blinking cursor for real-time streaming feedback.
- **Routing**: Basic structure for `/`, `/login`, and `/register` is established.
- **Styling**: Tailwind 4 is configured and used across the application.

## 📜 Development Directives
## always try to use mcp servers also
- **Environment**: Ensure `.env.development` is populated with valid Firebase and API base URL values.
- **Styling**: Do not bypass Tailwind CSS unless explicitly required. Avoid inline styles.
- **Components**: Keep components small and focused. Extract logic into custom hooks (e.g., `useChat.js`) where appropriate.
- **Security**: Never expose API keys or credentials in logs or commits.
- **Testing**: Add or update tests when modifying core logic or UI components.

## 🔗 External Dependencies
- **Backend API**: [jerry-api](https://github.com/tejasM17/jerry-api) must be running for chat features to work.
