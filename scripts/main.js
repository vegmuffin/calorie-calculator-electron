var {app, BrowserWindow, Menu, ipcMain} = require('electron');
const url = require('url');
const path = require('path');

let win;
let np_win;
let dp_win;

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
            label: "Edit",
            submenu: [
                {
                    label: "Undo",
                    accelerator: "CmdOrCtrl+Z",
                    selector: "undo:"
                },
                {
                    label: "Redo",
                    accelerator: "Shift+CmdOrCtrl+Z",
                    selector: "redo:"
                },
                {
                    type: "separator"
                },
                {
                    label: "Cut",
                    accelerator: "CmdOrCtrl+X",
                    selector: "cut:"
                },
                {
                    label: "Copy",
                    accelerator: "CmdOrCtrl+C",
                    selector: "copy:"
                },
                {
                    label: "Paste",
                    accelerator: "CmdOrCtrl+V",
                    selector: "paste:"
                },
                {
                    label: "Select All",
                    accelerator: "CmdOrCtrl+A",
                    selector: "selectAll:"
                },
            ]
        },
        {
            label: "Produktai",
            submenu: [
                {
                    label: "Nauji kategorijos produktai",
                    accelerator: "CmdOrCtrl+P",
                    click()
                    {
                        newProductsWindow();
                    }
                },
                {
                    label: "Trinti produktus",
                    accelerator: "CmdOrCtrl+D",
                    click()
                    {
                        newDeleteWindow();
                    }
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    // win.toggleDevTools();
}

function newProductsWindow()
{
    if(!np_win)
    {
        let winBounds = BrowserWindow.getFocusedWindow().getBounds();
        np_win = new BrowserWindow({
            width: 1100, 
            height: 500,
            backgroundColor: '#FFF',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            x: winBounds["x"] + 50,
            y: winBounds["y"] + 50,
            resizable: false
        });

        np_win.loadURL(url.format({
            pathname: path.join(__dirname, '../newprod.html'),
            protocol: 'file',
            slashes: true
        }));

        np_win.on('closed', function() {
            np_win = null;
        });

        // np_win.toggleDevTools();
    }
    else
    {
        np_win.focus();
    }
}

function newDeleteWindow()
{
    if(!dp_win)
    {
        let winBounds = BrowserWindow.getFocusedWindow().getBounds();
        dp_win = new BrowserWindow({
            width: 500,
            height: 500,
            backgroundColor: '#FFF',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            x: winBounds["x"] + 50,
            y: winBounds["y"] + 50,
            resizable: false
        });

        dp_win.loadURL(url.format({
            pathname: path.join(__dirname, '../delprod.html'),
            protocol: 'file',
            slashes: true
        }));

        dp_win.on('closed', function() {
            dp_win = null;
        });

        // dp_win.toggleDevTools();
    }
    else
    {
        dp_win.focus();
    }
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

    // SYNC WITH MAIN WINDOW
    win.webContents.send("sync-data", data);

    // SYNC WITH DELETE WINDOW IF IT EXISTS
    if(dp_win)
    {
        dp_win.webContents.send("sync-data", data);
    }
    
    np_win.close();
});

ipcMain.on("delete-data", function(event, data) {
    jsonData = data;

    // SYNC WITH MAIN WINDOW
    win.webContents.send("sync-data", data);

    // SYNC WITH NEW PRODUCT WINDOW IF IT EXISTS
    if(np_win)
    {
        np_win.webContents.send("sync-data", data);
    }
    
    dp_win.close();
});