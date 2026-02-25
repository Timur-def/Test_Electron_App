import { useState, useEffect } from "react";
import "./MainPage.css";

export default function MainPage({ userRole }) {
  const [time, setTime] = useState(new Date());
  const [header, setHeader] = useState("");
  const [text, setText] = useState("");
  const day = time.getDate();
  const month = time.getMonth() + 1;
  const year = time.getFullYear();
  const [newsArr, setNewsArr] = useState([]);
  const [count, setCount] = useState(0);
  const [isModalWinText, setIsModalWinText] = useState(false);
  const [modalWinNews, setModalWinNews] = useState({});
  const [isModalWinAddNews, setIsModalWinAddNews] = useState(false);
  const [error, setError] = useState("");

  const openModalWin = (obj) => {
    setModalWinNews(obj);
    setIsModalWinText(true);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchNews = async () => {
      try {
        const data = await window.api.getNews();
        if (isMounted) {
          if (Array.isArray(data)) {
            console.log("ОК");
            setNewsArr(data);
          } else if (data && data.error) {
            console.error("Ошибка:", data.error);
          } else {
            console.warn("Получены некорректные данные:", data);
            setNewsArr([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Критическая ошибка:", err);
        }
      }
    };
    fetchNews();
    return () => {
      isMounted = false;
    };
  }, [count]);

  const handleAddNews = async () => {
    if (!window.api) return;
    if (!header || !text) {
      return setError("Введите заголовок и содержание новости");
    }
    try {
      const result = await window.api.addNews({
        header: header,
        text: text,
        date: `${day}.${month < 10 ? `0${month}` : month}.${year}`,
      });
      if (result) {
        console.log("OK");
        setError("");
        setCount((prev) => prev + 1);
        setText("");
        setHeader("");
      } else {
        setError(result.error || "Ошибка");
      }
    } catch (err) {
      console.error("Ошибка при входе:", err);
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.api) return;
    try {
      const result = await window.api.deleteNews({ id });
      if (result && result.success) {
        console.log("Удалено успешно");
        setCount((prev) => prev + 1);
      } else {
        console.error(result.error || "Ошибка при удалении");
      }
    } catch (err) {
      console.error("Ошибка:", err);
    }
  };

  return (
    <div className="mainPage">
      <div className="mainPage__header">
        <h1>Новости сайта и основная информация</h1>
        {userRole === "admin" ? (
          <button
            className="mainPage__addNewsWinBtn header"
            onClick={() => setIsModalWinAddNews(true)}
          >
            Добавить новость
          </button>
        ) : (
          <></>
        )}
      </div>
      <div className="mainPage__news">
        {newsArr.map((item) => (
          <div className="mainPage__newsCard" key={item._id}>
            <h1 className="mainPage__newsCardHeader">{item.header}</h1>
            <p className="mainPage__newsCardText">{item.text}</p>
            <p className="mainPage__newsCardDate">{item.date}</p>
            <div className="mainPage__newsCardBtns">
              {userRole === "admin" && (
                <button
                  className="mainPage__newsCardBtn"
                  onClick={() => handleDeleteNews(item._id)}
                >
                  Удалить новость
                </button>
              )}
              <button
                className="mainPage__newsCardBtn"
                onClick={() => openModalWin(item)}
              >
                Прочитать новость
              </button>
            </div>
          </div>
        ))}
      </div>
      {isModalWinText && (
        <>
          <div
            className="mainPage__backgroundModalWin"
            onClick={() => setIsModalWinText(false)}
          />
          <div className="mainPage__modalWin">
            <h1
              style={{ color: "white", marginLeft: "15px", marginTop: "15px" }}
            >
              {modalWinNews?.header}
            </h1>
            <p className="mainPage__modalWinText">{modalWinNews?.text}</p>
            <p style={{ color: "#c8c8c8", margin: "15px" }}>
              {modalWinNews?.date}
            </p>
            <button
              className="mainPage__modalWinBtn"
              onClick={() => setIsModalWinText(false)}
            >
              Выйти
            </button>
          </div>
        </>
      )}
      {userRole === "admin" && (
        <>
          {isModalWinAddNews && (
            <>
              <div
                className="mainPage__addNewsWinBackground"
                onClick={() => setIsModalWinAddNews(false)}
              />
              <div className="mainPage__addNewsWin">
                <div className="mainPage__addNewsWinInputs">
                  <input
                    className="mainPage__addNewsWinInp"
                    type="text"
                    placeholder="Заголовок"
                    value={header}
                    onChange={(e) => setHeader(e.target.value)}
                  />
                  <input
                    className="mainPage__addNewsWinInp text"
                    type="text"
                    placeholder="Содержание новости"
                    value={text}
                    onChange={(e) => {
                      if (e.target.value.length > 2000) {
                        setText(e.target.value.slice(0, 2000));
                        setError("Превышен объём символов.");
                      } else {
                        setText(e.target.value);
                        setError("");
                      }
                    }}
                  />
                </div>
                {error && (
                  <p style={{ color: "red", fontSize: "14px" }}>{error}</p>
                )}
                <button
                  className="mainPage__addNewsWinBtn"
                  onClick={() => (
                    handleAddNews(),
                    error
                      ? setIsModalWinAddNews(true)
                      : setIsModalWinAddNews(false)
                  )}
                >
                  Добавить новость
                </button>
                <button
                  className="mainPage__addNewsWinBtn"
                  onClick={() => (setIsModalWinAddNews(false), setError(""))}
                >
                  Выйти
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
