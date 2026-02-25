import { useEffect, useState } from "react";
import "./UserPage.css";

export default function UserPage({ user }) {
  const [form, setForm] = useState({
    login: user?.login,
    oldPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [res, setRes] = useState(false);
  const [users, setUsers] = useState([]);
  const [isModalWinGuestUsers, setIsModalWinGuestUsers] = useState(false);
  const [selectValue, setSelectValue] = useState("user");

  const handleChangePassword = async () => {
    if (!window.api) return;
    if (!form.login || !form.oldPassword) {
      return setError("Введите новый пароль и старый пароль");
    }
    if (form.newPassword.split("").length < 8) {
      return setError("Пароль должен быть более 8 симолов");
    }
    if (form.newPassword === form.oldPassword) {
      return setError("Пароль не должен быть точь в точь, как старый");
    }
    try {
      setError("");
      const result = await window.api.changePassword(form);
      if (result && result.success) {
        console.log("Успешная смена пароля");
        setRes(true);
        setForm({
          login: user?.login,
          oldPassword: "",
          newPassword: "",
        });
      } else {
        setError(result.error || "Неверный старый пароль");
      }
    } catch (err) {
      console.error("Ошибка:", err);
      setError("Ошибка соединения с базой");
    }
  };
  const handleChangeRole = async (login, role) => {
    if (!window.api) return;
    if (!login || !role) {
      return setError("Проверьте данные");
    }
    try {
      setError("");
      const result = await window.api.changeRole({ login, role });
      if (result && result.success) {
        console.log("Успешное утверждение роли");
        setUsers((prev) => prev.filter((u) => u.login !== login));
      } else {
        setError(result.error || "Ошибка");
      }
    } catch (err) {
      console.error("Ошибка:", err);
      setError("Ошибка соединения с базой");
    }
  };

  useEffect(() => {
    const fetchGetUsersGuest = async () => {
      if (!window.api) return;
      try {
        setError("");
        const result = await window.api.getUsersGuest();
        if (result) {
          console.log("Данные получены");
          setUsers(result);
        } else {
          setError(result.error || "Ошибка данных");
        }
      } catch (err) {
        console.error("Ошибка:", err);
        setError("Ошибка соединения с базой");
      }
    };
    fetchGetUsersGuest();
  }, []);

  return (
    <div className="userPage">
      <div className="userPage__header">
        <h2>
          {user.name} ({user.login})
        </h2>
        <p>
          Вы {user.role === "admin" && "Администратор"}
          {user.role === "user" && "Посетитель"}
          {user.role === "guest" &&
            "Гость. Дождитесь, когда Администратор подтвердит ваш аккаунт"}
        </p>
      </div>
      <div className="userPage__winChangePassword">
        <input
          type="text"
          value={form.oldPassword}
          onChange={(e) =>
            setForm({ ...form, oldPassword: e.target.value.trim() })
          }
          placeholder="Ваш старый пароль"
        />
        <input
          type="text"
          value={form.newPassword}
          onChange={(e) =>
            setForm({ ...form, newPassword: e.target.value.trim() })
          }
          placeholder="Ваш новый пароль"
        />
        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
        {res && (
          <p style={{ color: "white", fontSize: "14px" }}>Password changed</p>
        )}
        <button onClick={handleChangePassword}>Сменить пароль</button>
      </div>
      {user.role === "admin" && (
        <div className="userPage__winUsersGuest">
          {users.map((item) => {
            return (
              <div className="userPage__winUsersGuestCard" key={item._id}>
                <p className="userPage__winUsersGuestCardName">{item.name}</p>
                <p className="userPage__winUsersGuestCardLogin">{item.login}</p>
                <select
                  value={selectValue}
                  onChange={(e) => {
                    setSelectValue(e.target.value);
                  }}
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Администратор</option>
                </select>
                <button
                  onClick={() => handleChangeRole(item.login, selectValue)}
                >
                  Утвердить роль
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
