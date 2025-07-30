import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Enhanced global error handlers with detailed logging
window.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Unhandled promise rejection detected:');
  console.error('Error reason:', event.reason);
  console.error('Promise:', event.promise);
  console.error('Stack trace:', event.reason?.stack);
  
  // Track specific database errors
  if (event.reason?.message?.includes('invalid input syntax for type integer')) {
    console.error('🚨 PostgreSQL NaN error detected in unhandled rejection');
  }
  
  // Prevent the error from being logged to console again
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

createRoot(document.getElementById("root")!).render(<App />);
