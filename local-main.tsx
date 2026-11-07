import { createRoot } from "react-dom/client";
import "./app/globals.css";
import Home from "./app/page";

const root = document.getElementById("root");
if (!root) throw new Error("Krillion could not find its application root.");
createRoot(root).render(<Home />);
