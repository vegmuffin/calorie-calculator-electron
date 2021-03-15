var {app, BrowserWindow, Menu, ipcMain} = require('electron');
const url = require('url');
const path = require('path');

let win;
let nc_win;

var jsonData;

function createWindow()
{
    win = new BrowserWindow({
        width: 1280, 
        height: 720,
        backgroundColor: '#FFF',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        x: 125,
        y: 125,
        resizable: false
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, '../index.html'),
        protocol: 'file',
        slashes: true
    }));
}

function setMainMenu()
{
    const template = [
        {
            label: "",
            submenu: [
                {
                    label: "Išeiti",
                    click()
                    {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: "Produktai",
            submenu: [
                {
                    label: "Nauji kategorijos produktai",
                    accelerator: "Cmd+P",
                    click()
                    {
                        newProductsWindow();
                    }
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function newProductsWindow()
{
    let winBounds = win.getBounds();
    nc_win = new BrowserWindow({
        width: 1100, 
        height: 500,
        backgroundColor: '#FFF',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        parent: win,
        x: winBounds["x"] + 50,
        y: winBounds["y"] + 50,
        skipTaskbar: true,
        resizable: false
    });

    nc_win.loadURL(url.format({
        pathname: path.join(__dirname, '../newprod.html'),
        protocol: 'file',
        slashes: true
    }));
}

app.on('ready', () => {
    createWindow();
    setMainMenu();
});

ipcMain.on("load-data", function(event, data) {
    jsonData = data;
});

ipcMain.on("retrieve-data", function (event) {
    event.sender.send("finalize-data", jsonData);
});

ipcMain.on("new-data", function(event, data) {
    jsonData = data;

    win.webContents.send("sync-data", data);
    
    nc_win.close();
});