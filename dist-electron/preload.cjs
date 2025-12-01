"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  // Info de la app
  getVersion: () => electron.ipcRenderer.invoke("app:getVersion"),
  getPlatform: () => electron.ipcRenderer.invoke("app:getPlatform"),
  // Serial Port (Báscula)
  serialPort: {
    list: () => electron.ipcRenderer.invoke("serial:list"),
    open: (port, baudRate) => electron.ipcRenderer.invoke("serial:open", port, baudRate),
    close: () => electron.ipcRenderer.invoke("serial:close"),
    read: () => electron.ipcRenderer.invoke("serial:read"),
    getPortInfo: () => electron.ipcRenderer.invoke("serial:getPortInfo"),
    onData: (callback) => {
      const listener = (_event, data) => callback(data);
      electron.ipcRenderer.on("serial:data", listener);
      return () => electron.ipcRenderer.removeListener("serial:data", listener);
    }
  },
  // Printer (Impresora Térmica)
  printer: {
    list: () => electron.ipcRenderer.invoke("printer:list"),
    print: (data) => electron.ipcRenderer.invoke("printer:print", data)
  },
  // Database (SQLite Offline)
  db: {
    query: (sql, params) => electron.ipcRenderer.invoke("db:query", sql, params),
    exec: (sql) => electron.ipcRenderer.invoke("db:exec", sql),
    transaction: (queries) => electron.ipcRenderer.invoke("db:transaction", queries),
    get: (sql, params) => electron.ipcRenderer.invoke("db:get", sql, params),
    run: (sql, params) => electron.ipcRenderer.invoke("db:run", sql, params),
    all: (sql, params) => electron.ipcRenderer.invoke("db:all", sql, params)
  },
  // Sync
  sync: {
    start: () => electron.ipcRenderer.invoke("sync:start"),
    stop: () => electron.ipcRenderer.invoke("sync:stop"),
    getStatus: () => electron.ipcRenderer.invoke("sync:getStatus"),
    onStatusChange: (callback) => {
      electron.ipcRenderer.on("sync:statusChange", (_event, status) => callback(status));
    }
  },
  // Storage (archivos locales)
  storage: {
    get: (key) => electron.ipcRenderer.invoke("storage:get", key),
    set: (key, value) => electron.ipcRenderer.invoke("storage:set", key, value),
    delete: (key) => electron.ipcRenderer.invoke("storage:delete", key),
    clear: () => electron.ipcRenderer.invoke("storage:clear")
  },
  // Updater (Auto-update con GitHub Releases)
  updater: {
    check: () => electron.ipcRenderer.invoke("updater:check"),
    download: () => electron.ipcRenderer.invoke("updater:download"),
    installAndRestart: () => electron.ipcRenderer.invoke("updater:installAndRestart"),
    openExternal: (url) => electron.ipcRenderer.invoke("updater:openExternal", url),
    onUpdateAvailable: (callback) => {
      const listener = (_event, info) => callback(info);
      electron.ipcRenderer.on("update-available", listener);
      return () => electron.ipcRenderer.removeListener("update-available", listener);
    },
    onDownloadProgress: (callback) => {
      const listener = (_event, progress) => callback(progress);
      electron.ipcRenderer.on("update-download-progress", listener);
      return () => electron.ipcRenderer.removeListener("update-download-progress", listener);
    },
    onUpdateDownloaded: (callback) => {
      const listener = (_event, info) => callback(info);
      electron.ipcRenderer.on("update-downloaded", listener);
      return () => electron.ipcRenderer.removeListener("update-downloaded", listener);
    }
  }
});
