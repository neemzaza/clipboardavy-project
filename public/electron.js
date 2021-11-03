const path = require('path');

const { app, BrowserWindow, Menu, MenuItem, ipcMain,TouchBar } = require('electron');
app.setName("Clipboardavy")

const { TouchBarLabel } = TouchBar

const db = require('./db/stores/todoItem');

const isDev = require('electron-is-dev');
const ipc = ipcMain

global.db = db

let dataLength = 0;

const labelBar = new TouchBarLabel()

const readAllFunc = () => {
  db.readAll().then(allTodolists => {

    labelBar.label = allTodolists.length + " text"
  })
}

const onCopied = () => {
  labelBar.label = "Copied to Clipboard"
  setTimeout(() => {
    labelBar.label = 0 + " text"
  }, 3000)
}

const touchBar = new TouchBar({
  items: [
    labelBar
  ]
})

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    fullscreenable: false,
    maxWidth: 400,
    maxHeight: 600,
    minWidth: 400,
    minHeight: 600,
    title: "Clipboardavy",
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, "./appicon/icons/png/1024x1024.png")
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  // Close Application
  ipc.on('closeApp', () => {
    console.log("CLOSEE!!")
    app.quit();
  })

  ipc.on('minimizeApp', () => {
    win.minimize()
  })

  ipc.on('updateTouchBar', () => {
    readAllFunc()
    win.setTouchBar(touchBar)
  })

  ipc.on('onCopied', () => {
    onCopied()
  })
}

if (process.platform === 'darwin') {
  app.dock.setIcon(path.join(__dirname, "./appicon/icons/png/1024x1024.png"));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow).then();

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});