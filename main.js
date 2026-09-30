const { app, BrowserWindow, Notification, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 400,
        minHeight: 400,
        minWidth: 600,
        title: "Homework App",
        icon: path.join(__dirname, "icon.ico"),
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    //mainWindow.removeMenu();
    mainWindow.loadFile("web/index.html");
    mainWindow.on("close", function() {
        mainWindow = null;
    });

    ipcMain.on("resize-window", function() {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on("minimize-window", function() {
        mainWindow.minimize();
    });
    ipcMain.on("close-window", app.quit);
}

app.on("ready", createWindow);
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});