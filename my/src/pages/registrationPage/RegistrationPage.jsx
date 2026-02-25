import { useState } from "react";
import "./RegistrationPage.css";

export default function RegistrationPage({ onRegisterSuccess }) {
  const [form, setForm] = useState({ name: "", login: "", password: "" });
  const [error, setError] = useState("");
  const [isViewPassword, setIsViewPassword] = useState(false);

  const handleRegister = async () => {
    if (!window.api) return;
    if (!form.login || !form.password || !form.name) {
      return setError("Введите имя, логин и пароль");
    }
    if (form.password.split('').length < 8) {
      return setError("Пароль должен быть более 8 симолов");
    }
    try {
      const result = await window.api.register(form);
      if (result && !result.error) {
        onRegisterSuccess(result);
      } else {
        setError(result.error || "Ошибка регистрации");
      }
    } catch (err) {
      console.error("Критический сбой:", err);
      setError("Сбой системы: " + err.message);
    }
  };

  return (
    <div className="registrationPage">
      <h1>Регистрация</h1>
      <div className="registrationPage__inputs">
        <input
          className="registrationPage__inp"
          placeholder="Имя"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value.trim() })}
        />
        <input
          className="registrationPage__inp"
          placeholder="Логин"
          value={form.login}
          onChange={(e) => setForm({ ...form, login: e.target.value.trim() })}
        />
        <input
          className="registrationPage__inp"
          type={isViewPassword ? "text" : "password"}
          placeholder="Пароль"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value.trim() })}
        />
        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
        <div className="registrationPage__viewPasswordWin">
          <input
            style={{ cursor: "pointer" }}
            type="checkbox"
            checked={isViewPassword}
            onChange={() => setIsViewPassword((prev) => !prev)}
          />
          <p
            className="registrationPage__viewPasswordWinP"
            onClick={() => setIsViewPassword((prev) => !prev)}
          >
            {isViewPassword ? "Скрыть пароль" : "Показать пароль"}
          </p>
        </div>
        <button onClick={handleRegister} className="registrationPage__btnReg">
          Создать аккаунт
        </button>
      </div>
    </div>
  );
}
