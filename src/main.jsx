import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import ShopContextProvider from "./Context/ShopContext.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ShopContextProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <App />
    </ShopContextProvider>
  </BrowserRouter>
);
