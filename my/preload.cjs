const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getUsers: () => ipcRenderer.invoke("get-users"),
  register: (data) => ipcRenderer.invoke("register", data),
  login: (data) => ipcRenderer.invoke("login", data),
  addNews: (data) => ipcRenderer.invoke("addNews", data),
  deleteNews: (data) => ipcRenderer.invoke("deleteNews", data),
  getNews: () => ipcRenderer.invoke("get-news"),
});
