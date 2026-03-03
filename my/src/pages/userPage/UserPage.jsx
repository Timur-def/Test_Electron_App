import { useEffect, useState } from "react";
import "./UserPage.css";
import Message from "../../components/message/Message";

export default function UserPage({ user, setCurrentUser }) {
  const [formChangePassword, setFormChangePassword] = useState({
    login: user?.login,
    oldPassword: "",
    newPassword: "",
  });
  const [formChangeName, setFormChangeName] = useState({
    login: user?.login,
    password: "",
    newName: "",
  });
  const [formChangeLogin, setFormChangeLogin] = useState({
    login: user?.login,
    password: "",
    newLogin: "",
  });
  const [error, setError] = useState("");
  const [updateMess, setUpdateMess] = useState(false);
  const [textMess, setTextMess] = useState("");
  const [users, setUsers] = useState([]);
  const [isModalWinGuestUsers, setIsModalWinGuestUsers] = useState(false);
  const [selectValue, setSelectValue] = useState("user");
  const [countUpdateMess, setCountUpdateMess] = useState(0);

  const handleChangePassword = async () => {
    if (!window.api) return;
    if (!formChangePassword.newPassword || !formChangePassword.oldPassword) {
      setCountUpdateMess((prev) => prev + 1);
      setUpdateMess(true);
      setTimeout(() => setUpdateMess(false), 4000);
      setError("Введите новый пароль и старый пароль");
      return;
    }
    if (formChangePassword.newPassword.split("").length < 8) {
      setCountUpdateMess((prev) => prev + 1);
      setUpdateMess(true);
      setTimeout(() => setUpdateMess(false), 4000);
      setError("Пароль должен быть более 8 симолов");
      return;
    }
    if (formChangePassword.newPassword === formChangePassword.oldPassword) {
      setCountUpdateMess((prev) => prev + 1);
      setUpdateMess(true);
      setTimeout(() => setUpdateMess(false), 4000);
      setError("Пароль не должен быть точь в точь, как старый");
      return;
    }
    try {
      setError("");
      const result = await window.api.changePassword({...formChangePassword, login:user.login});
      if (result && result.success) {
        setTextMess("Успешная смена пароля");
        setFormChangePassword({
          login: user?.login,
          oldPassword: "",
          newPassword: "",
        });
      } else {
        setError(result.error || "Неверный старый пароль");
      }
    } catch (err) {
      setError("Ошибка соединения с базой");
    } finally {
      setCountUpdateMess((prev) => prev + 1);
      setUpdateMess(true);
      setTimeout(() => setUpdateMess(false), 4000);
    }
  };

  const handleChangeName = async () => {
    if (!window.api) return;
    if (!formChangeName.newName || !formChangeName.password) {
      setCountUpdateMess((prev) => prev + 1);
      setError("Введите пароль и новое имя");
      setUpdateMess(true);
      setTimeout(() => setUpdateMess(false), 4000);
      return;
    }
    try {
      setError("");
      const result = await window.api.changeName({...formChangeName, login:user.login});
      if (result && result.success) {
        setTextMess("Успешная смена имени");
        setCurrentUser((prev) => ({
          ...prev,
          name: result.newName,
        }));
        setFormChangeName({
          login: user?.login,
          password: "",
          newName: "",
        });
      } else {
        setError(result.error || "Неверный пароль");
      }
    } catch (err) {
      setError("Ошибка соединения с базой");
    } finally {
      setCountUpdateMess((prev) => prev + 1);
      setUpdateMess(true);
      setTimeout(() => setUpdateMess(false), 4000);
    }
  };
  const handleChangeLogin = async () => {
    if (!window.api) return;
    if (!formChangeLogin.newLogin || !formChangeLogin.password) {
      setCountUpdateMess((prev) => prev + 1);
      setUpdateMess(true);
      setTimeout(() => setUpdateMess(false), 3000);
      setError("Введите пароль и новый логин");
      return;
    }
    try {
      setError("");
      const result = await window.api.changeLogin({...formChangeLogin, login:user.login});
      if (result && result.success) {
        setTextMess("Успешная смена логина");
        setCurrentUser((prev) => ({
          ...prev,
          login: result.newLogin,
        }));
        setFormChangeLogin({
          login: user?.login,
          password: "",
          newLogin: "",
        });
      } else {
        setError(result.error || "Неверный пароль");
      }
    } catch (err) {
      setError("Ошибка соединения с базой");
    } finally {
      setCountUpdateMess((prev) => prev + 1);
      setUpdateMess(true);
      setTimeout(() => setUpdateMess(false), 5000);
    }
  };

  const handleChangeRole = async (login, role) => {
    if (!window.api) return;
    if (!login || !role) {
      setUpdateMess(true);
      setTimeout(() => setUpdateMess(false), 4000);
      setError("Проверьте данные");
      return;
    }
    try {
      setTextMess("");
      setError("");
      const result = await window.api.changeRole({ login, role });
      if (result && result.success) {
        setTextMess("Успешное утверждение роли");
        setUsers((prev) => prev.filter((u) => u.login !== login));
        setSelectValue("user");
      } else {
        setError(result.error || "Ошибка");
      }
    } catch (err) {
      setError("Ошибка соединения с базой");
    } finally {
      setUpdateMess(true);
      setTimeout(() => setUpdateMess(false), 4000);
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
        <div className="userPage__userInf">
          <h2 style={{ color: "white" }}>
            {user.name} <span style={{ color: "white" }}>({user.login})</span>
          </h2>
          <p style={{ color: "white" }}>
            Вы {user.role === "admin" && "Администратор"}
            {user.role === "user" && "Посетитель"}
            {user.role === "guest" &&
              "Гость. Дождитесь, когда Администратор подтвердит ваш аккаунт"}
          </p>
        </div>
        {user.role === "admin" && (
          <div className="userPage__usersGuestDiv">
            {users.length == 0 ? (
              <p>Заявок нет</p>
            ) : (
              <>
                <p onClick={() => setIsModalWinGuestUsers(true)}>
                  Посмотреть <span>{users.length}</span>
                  {users.length == 1 && <span> заявка</span>}
                  {users.length <= 4 && users.length > 1 && (
                    <span> заявки</span>
                  )}
                  {users.length > 4 && <span> заявок</span>}
                </p>
              </>
            )}
          </div>
        )}
      </div>
      {user.role !== "guest" && (
        <div className="userPage__accountAction">
          <div className="userPage__winChange">
            <p style={{ color: "white" }}>Окно смены пароля</p>
            <input
              type="text"
              value={formChangePassword.oldPassword}
              onChange={(e) =>
                setFormChangePassword({
                  ...formChangePassword,
                  oldPassword: e.target.value.trim(),
                })
              }
              placeholder="Ваш старый пароль"
              className="userPage__winChangeInp"
            />
            <input
              type="text"
              value={formChangePassword.newPassword}
              onChange={(e) =>
                setFormChangePassword({
                  ...formChangePassword,
                  newPassword: e.target.value.trim(),
                })
              }
              placeholder="Ваш новый пароль"
              className="userPage__winChangeInp"
            />
            <button
              className="userPage__winChangeBtn"
              onClick={handleChangePassword}
            >
              Сменить пароль
            </button>
          </div>
          <div className="userPage__winChange">
            <p style={{ color: "white" }}>Окно смены имени</p>
            <input
              type="text"
              value={formChangeName.newName}
              onChange={(e) =>
                setFormChangeName({
                  ...formChangeName,
                  newName: e.target.value.trim(),
                })
              }
              placeholder="Ваше новое имя"
              className="userPage__winChangeInp"
            />
            <input
              type="text"
              value={formChangeName.password}
              onChange={(e) =>
                setFormChangeName({
                  ...formChangeName,
                  password: e.target.value.trim(),
                })
              }
              placeholder="Ваш пароль"
              className="userPage__winChangeInp"
            />
            <button
              className="userPage__winChangeBtn"
              onClick={handleChangeName}
            >
              Сменить имя
            </button>
          </div>
          <div className="userPage__winChange">
            <p style={{ color: "white" }}>Окно смены логина</p>
            <input
              type="text"
              value={formChangeLogin.newLogin}
              onChange={(e) =>
                setFormChangeLogin({
                  ...formChangeLogin,
                  newLogin: e.target.value.trim(),
                })
              }
              placeholder="Ваш новый логин"
              className="userPage__winChangeInp"
            />
            <input
              type="text"
              value={formChangeLogin.password}
              onChange={(e) =>
                setFormChangeLogin({
                  ...formChangeLogin,
                  password: e.target.value.trim(),
                })
              }
              placeholder="Ваш пароль"
              className="userPage__winChangeInp"
            />
            <button
              className="userPage__winChangeBtn"
              onClick={handleChangeLogin}
            >
              Сменить логин
            </button>
          </div>
        </div>
      )}

      {user.role === "admin" && (
        <>
          {isModalWinGuestUsers && (
            <>
              <div
                className="userPage__modalWinGuestUsersBackGround"
                onClick={() => setIsModalWinGuestUsers(false)}
              />
              <div className="userPage__modalWinGuestUsers">
                <div className="userPage__modalWinGuestUsersTable">
                  <div className="userPage__winUsersGuest">
                    {users.map((item) => {
                      return (
                        <div
                          className="userPage__winUsersGuestCard"
                          key={item._id}
                        >
                          <p className="userPage__winUsersGuestCardName">
                            {item.name}
                          </p>
                          <p className="userPage__winUsersGuestCardLogin">
                            {item.login}
                          </p>
                          <select
                            className="userPage__winUsersGuestCardSelect"
                            value={selectValue}
                            onChange={(e) => {
                              setSelectValue(e.target.value);
                            }}
                          >
                            <option
                              value="user"
                              className="userPage__winUsersGuestCardSelectOption"
                            >
                              Пользователь
                            </option>
                            <option
                              value="admin"
                              className="userPage__winUsersGuestCardSelectOption"
                            >
                              Администратор
                            </option>
                          </select>
                          <button
                            onClick={() =>
                              handleChangeRole(item.login, selectValue)
                            }
                            className="userPage__winUsersGuestCardBtn"
                          >
                            Утвердить роль
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  className="userPage__modalWinGuestUsersBtn"
                  onClick={() => setIsModalWinGuestUsers(false)}
                >
                  Выйти
                </button>
              </div>
            </>
          )}
        </>
      )}
      {updateMess && (
        <Message
          key={countUpdateMess}
          text={error ? error : textMess}
          type={error ? "error" : "notErr"}
        />
      )}
    </div>
  );
}
