import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { FirebaseAuthProvider } from "./features/auth/FirebaseAuthProvider";
import { Toaster } from "sonner";
import router from "./app/router";
import "./index.css";
import { AuthProvider } from "./features/auth/AuthProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <FirebaseAuthProvider>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster theme="dark" position="top-center" richColors closeButton />
    </AuthProvider>
  </FirebaseAuthProvider>,
);
