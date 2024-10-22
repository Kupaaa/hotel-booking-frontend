
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/admin-page/adminPage";
import HomePage from "./pages/client-page/homePage";

function App() {
  return (
<BrowserRouter>
<Routes path="/*">
<Route path="/" element={<HomePage/>}/>
<Route path="/admin/*" element={<AdminPage/>}/>
</Routes>
</BrowserRouter>
  );
}

export default App;
