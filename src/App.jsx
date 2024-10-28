
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/admin-page/adminPage";
import HomePage from "./pages/client-page/homePage";
import Test from "./components/test/test";
import LoginPage from "./pages/login/login";
import CategoriesPage from "./pages/client-page/categories";

function App() {
  return (
<BrowserRouter>
<Routes path="/*">
<Route path="/" element={<HomePage/>}/>
<Route path="/admin/*" element={<AdminPage/>}/>
<Route path="/test/*" element={<Test/>}/>
<Route path="/login/*" element={<LoginPage/>}/>
<Route path="/categories/*" element={<CategoriesPage/>}/>
</Routes>
</BrowserRouter>
  );
}

export default App;
