import { useState } from "react";
import "./LoginPage.css";

export default function LoginPage({ onLoginSuccess }) {
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [isViewPassword, setIsViewPassword] = useState(false);

  const handleLogin = async () => {
    if (!window.api) return;
    if (!form.login || !form.password) {
      return setError("Введите логин и пароль");
    }
    try {
      setError("");
      const result = await window.api.login(form);

      if (result && result.success) {
        console.log("Успешный вход:");
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        }
      } else {
        setError(result.error || "Неверный логин или пароль");
      }
    } catch (err) {
      console.error("Ошибка при входе:", err);
      setError("Ошибка соединения с базой");
    }
  };

  return (
    <div className="loginPage">
      <div className="loginPage__inputs">
        <h1>Вход</h1>
        <input
          className="loginPage__inp"
          placeholder="Логин"
          value={form.login}
          onChange={(e) => setForm({ ...form, login: e.target.value.trim() })}
        />
        <input
          className="loginPage__inp"
          type={isViewPassword ? "text" : "password"}
          placeholder="Пароль"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value.trim() })}
        />
        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
        <div className="loginPage__viewPasswordWin">
          <input
            style={{ cursor: "pointer" }}
            type="checkbox"
            checked={isViewPassword}
            onChange={() => setIsViewPassword((prev) => !prev)}
          />
          <p
            className="loginPage__viewPasswordWinP"
            onClick={() => setIsViewPassword((prev) => !prev)}
          >
            {isViewPassword ? "Скрыть пароль" : "Показать пароль"}
          </p>
        </div>
        <button className="loginPage__btnLog" onClick={handleLogin}>
          Войти
        </button>
      </div>
    </div>
  );
}
