const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getUsersGuest: () => ipcRenderer.invoke("getUsersGuest"),
  register: (data) => ipcRenderer.invoke("register", data),
  login: (data) => ipcRenderer.invoke("login", data),
  addNews: (data) => ipcRenderer.invoke("addNews", data),
  deleteNews: (data) => ipcRenderer.invoke("deleteNews", data),
  changePassword: (data) => ipcRenderer.invoke("changePassword", data),
  changeName: (data) => ipcRenderer.invoke("changeName", data),
  changeLogin: (data) => ipcRenderer.invoke("changeLogin", data),
  changeRole: (data) => ipcRenderer.invoke("changeRole", data),
  getNews: () => ipcRenderer.invoke("get-news"),
});
