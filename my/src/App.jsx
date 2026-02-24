import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import RegistrationPage from "./pages/registrationPage/RegistrationPage";
import LoginPage from "./pages/loginPage/LoginPage";
import MainPage from "./pages/mainPage/MainPage";
import UserPage from "./pages/userPage/UserPage";
import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("login");
  
  // Функция для выхода
  const handleLogout = () => setCurrentUser(null);
  // 1. Если пользователь НЕ вошел — показываем только формы
  if (!currentUser) {
    return (
      <div className="winLogOrReg">
        {view === "login" ? (
          <div className="window">
            <LoginPage
              onLoginSuccess={(userData) => setCurrentUser(userData)}
            />
            <button className="window__btn" onClick={() => setView("register")}>
              Регистрация
            </button>
          </div>
        ) : (
          <div className="window">
            <RegistrationPage
              onRegisterSuccess={(userData) => setCurrentUser(userData)}
            />
            <button className="window__btn" onClick={() => setView("login")}>
              Войти
            </button>
          </div>
        )}
      </div>
    );
  }
  // 2. Если пользователь ВОШЕЛ — показываем основной интерфейс
  return (
    <div className="App">
      <div className="App__btnsLinkBoard">
        <h1 style={{margin:'15px', color:"white"}}>Test Site</h1>
        <div className="App__btns">
          <Link to="/" className="App__btn">Главная</Link>
          <Link to="/userPage" className="App__btn">Личный кабинет</Link>
        </div>
        <div className="App__userWin">
          <Link to="/userPage" className="App__userWinUserName"><p>{currentUser.name}</p></Link>
          <button className="App__userWinBtn" onClick={handleLogout}>Выйти</button>
        </div>
      </div>
      <div className="App__renderWin">
        <Routes>
          <Route path="/" element={<MainPage userRole={currentUser.role}/>} />
          <Route path="/userPage" element={<UserPage user={currentUser}/>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
