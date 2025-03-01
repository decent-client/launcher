

import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Launcher from "~/routes/Launcher";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route index element={<Launcher />} />
    </Routes>
  </BrowserRouter>
);
