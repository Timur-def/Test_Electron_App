const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

mongoose
  .connect("mongodb://127.0.0.1:27017/my_electron_db")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Error:", err));

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    login: String,
    password: String,
    role: String,
  }),
);
const News = mongoose.model(
  "News",
  new mongoose.Schema({
    header: String,
    text: String,
    date: String,
  }),
);
// добавление модели Пользователей и Новостей


function createWindow() { // создаём окно и настраиваем его
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  const VITE_URL = "http://localhost:5173";
  win.loadURL(VITE_URL);
  win.once("ready-to-show", () => {
    win.show();
    win.webContents.openDevTools();
  });
  win.webContents.on("did-fail-load", () => {
    console.log("Vite еще не готов, пробую снова через 2 сек...");
    setTimeout(() => {
      win.loadURL(VITE_URL);
    }, 2000);
  });
}

ipcMain.handle("getUsersGuest", async () => { // получаем всех Пользователей со значение guest
  const users = await User.find({ role: "guest" }).lean();
  return users.map((user) => ({
    ...user,
    _id: user._id.toString(),
  }));
});

ipcMain.handle("register", async (event, { name, login, password }) => { // регистрация
  try {
    const existingUser = await User.findOne({ login: login });
    if (existingUser) {
      return { error: "Этот логин уже занят. Выберите другой." };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      login:login,
      password: hashedPassword,
      role: "guest",
    });
    const saved = await newUser.save();
    const user = saved.toObject();
    user._id = user._id.toString();
    delete user.password;
    return { success: true, user:user }; // отдаём "успех" и объект на фронт-энд
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    return { success: false, error: "Ошибка сервера при регистрации" };
  }
});

ipcMain.handle("login", async (event, { login, password }) => { // вход в аккаунт
  try {
    const user = await User.findOne({ login });
    if (!user) {
      return { success: false, error: "Пользователь не найден" };
    }
    const isMatch = await bcrypt.compare(password, user.password); // проверка на совпадение паролей 
    if (isMatch) {
      const safeUser = user.toObject();
      delete safeUser.password;
      safeUser._id = safeUser._id.toString();
      return { success: true, user: safeUser };
    } else {
      return { success: false, error: "Неверный пароль" };
    }
  } catch (err) {
    return { success: false, error: "Ошибка сервера базы данных" };
  }
});

ipcMain.handle("changeRole", async (event, { login, role }) => { // смена поля role у Пользователей 
  try {
    const user = await User.findOne({ login });
    if (!user) {
      return { success: false, error: "Пользователь не найден" };
    }
    if (user.role !== role) {
      user.role = role;
      await user.save();
      const safeUser = user.toObject();
      safeUser._id = safeUser._id.toString();
      delete safeUser.password;
      return { success: true, user: safeUser };
    } else {
      return {
        success: false,
        error: "У пользователя уже установлена эта роль",
      };
    }
  } catch (err) {
    console.error(err);
    return { success: false, error: "Ошибка сервера базы данных" };
  }
});

ipcMain.handle(
  "changePassword",
  async (event, { login, oldPassword, newPassword }) => { // смена пароля у Пользователя 
    try {
      const user = await User.findOne({ login });
      if (!user) {
        return { error: "Пользователь не найден" };
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (isMatch) {
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return { success: true };
      } else {
        return { success: false, error: "Неверный старый пароль" };
      }
    } catch (err) {
      return { success: false, error: "Ошибка сервера базы данных" };
    }
  },
);

ipcMain.handle("changeName", async (event, { login, newName, password }) => { // смена имени у Пользователя 
  try {
    const user = await User.findOne({ login });
    if (!user) {
      return { error: "Пользователь не найден" };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      user.name = newName;
      await user.save();
      return { success: true, newName: user.name };
    } else {
      return { success: false, error: "Неверный пароль" };
    }
  } catch (err) {
    return { success: false, error: "Ошибка сервера базы данных" };
  }
});

ipcMain.handle("changeLogin", async (event, { login, newLogin, password }) => {// смена логина у Пользователя 
  try {
    const user = await User.findOne({ login });
    if (!user) {
      return { error: "Пользователь не найден" };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      user.login = newLogin;
      await user.save();
      return { success: true, newLogin: user.login };
    } else {
      return { success: false, error: "Неверный пароль" };
    }
  } catch (err) {
    return { success: false, error: "Ошибка сервера базы данных" };
  }
});

ipcMain.handle("addNews", async (event, data) => {// добавление новости
  try {
    const newNews = new News({ ...data });
    const saved = await newNews.save();
    const obj = saved.toObject();
    obj._id = obj._id.toString();
    return obj;
  } catch (e) {
    return { error: "Oшибка базы" };
  }
});

ipcMain.handle("deleteNews", async (event, data) => { // удаление новости
  try {
    const id = typeof data === "object" ? data.id : data;
    if (!id) {
      return { success: false, error: "ID не предоставлен" };
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Некорректный формат ID" };
    }
    const result = await News.deleteOne({ _id: id });
    if (result.deletedCount === 1) {
      console.log("OK");
      return { success: true };
    } else {
      console.log("Документ не найден:");
      return { success: false, error: "Документ не найден" };
    }
  } catch (err) {
    console.error("Ошибка при удалении:", err);
    return { success: false, error: "Ошибка сервера базы данных" };
  }
});

ipcMain.handle("get-news", async () => {// получение списка новостей
  const newsArr = await News.find().lean();
  return newsArr.map((news) => ({
    ...news,
    _id: news._id.toString(),
  }));
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
