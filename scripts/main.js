var {app, BrowserWindow, Menu, ipcMain, dialog} = require('electron');
const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

let win;
let np_win;
let dp_win;
let up_win;
let uc_win;
let addr_win;

var jsonData;
var emojiData;
var recipeData;

var devTools = false;

function createWindow()
{
    win = new BrowserWindow({
        width: 1235, 
        height: 800,
        backgroundColor: '#dfecde',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        x: 125,
        y: 125,
        resizable: false
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, '../templates/index.html'),
        protocol: 'file',
        slashes: true
    }));

    win.on('close', function() {
        app.quit();
    });
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
                    label: "Pridėti naują produktą",
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
                },
                {
                    label: "Naujinti produkto informaciją",
                    accelerator: "CmdOrCtrl+U",
                    click()
                    {
                        newUpdateWindow();
                    }
                },
                {
                    label: "Naujinti kategorijos informaciją",
                    accelerator: "CmdOrCtrl+K",
                    click()
                    {
                        newUpdateCatWindow();
                    }
                }
            ]
        },
        {
            label: "Duomenys",
            submenu: [
                {
                    label: "Išsaugoti produktų duomenis",
                    click()
                    {
                        saveData("~/Produktų duomenys.json", jsonData);
                    }
                },
                {
                    label: "Išsaugoti receptų duomenis",
                    click()
                    {
                        saveData("~/Receptų duomenys.json", recipeData);
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Įkelti produktų duomenis",
                    click()
                    {
                        loadData("products");
                    }
                },
                {
                    label: "Įkelti receptų duomenis",
                    click()
                    {
                        loadData("recipes");
                    }
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    if(devTools)
    {
        win.toggleDevTools();
    }
}

function newProductsWindow()
{
    if(!np_win)
    {
        let winBounds = BrowserWindow.getFocusedWindow().getBounds();
        np_win = new BrowserWindow({
            width: 1000, 
            height: 500,
            backgroundColor: '#dfecde',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            x: winBounds["x"] + 50,
            y: winBounds["y"] + 50,
            resizable: false
        });

        np_win.loadURL(url.format({
            pathname: path.join(__dirname, '../templates/newprod.html'),
            protocol: 'file',
            slashes: true
        }));

        np_win.on('closed', function() {
            np_win = null;
        });

        if(devTools)
        {
            np_win.toggleDevTools();
        }
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
            width: 600,
            height: 550,
            backgroundColor: '#dfecde',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            x: winBounds["x"] + 50,
            y: winBounds["y"] + 50,
            resizable: false
        });

        dp_win.loadURL(url.format({
            pathname: path.join(__dirname, '../templates/delprod.html'),
            protocol: 'file',
            slashes: true
        }));

        dp_win.on('closed', function() {
            dp_win = null;
        });

        if(devTools)
        {
            dp_win.toggleDevTools();
        }
    }
    else
    {
        dp_win.focus();
    }
}

function newUpdateWindow()
{
    if(!up_win)
    {
        let winBounds = BrowserWindow.getFocusedWindow().getBounds();
        up_win = new BrowserWindow({
            width: 760,
            height: 275,
            backgroundColor: '#dfecde',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            x: winBounds["x"] + 50,
            y: winBounds["y"] + 50,
            resizable: false
        });

        up_win.loadURL(url.format({
            pathname: path.join(__dirname, '../templates/updprod.html'),
            protocol: 'file',
            slashes: true
        }));

        up_win.on('closed', function() {
            up_win = null;
        });

        if(devTools)
        {
            up_win.toggleDevTools();
        }
    }
    else
    {
        up_win.focus();
    }
}

function newUpdateCatWindow()
{
    if(!uc_win)
    {
        let winBounds = BrowserWindow.getFocusedWindow().getBounds();
        uc_win = new BrowserWindow({
            width: 550,
            height: 425,
            backgroundColor: '#dfecde',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            x: winBounds["x"] + 50,
            y: winBounds["y"] + 50,
            resizable: false
        });

        uc_win.loadURL(url.format({
            pathname: path.join(__dirname, '../templates/updcat.html'),
            protocol: 'file',
            slashes: true
        }));

        uc_win.on('closed', function() {
            uc_win = null;
        });

        if(devTools)
        {
            uc_win.toggleDevTools();
        }
    }
    else
    {
        uc_win.focus();
    }
}

function newAddRecipeWindow()
{
    if(!addr_win)
    {
        let winBounds = BrowserWindow.getFocusedWindow().getBounds();
        addr_win = new BrowserWindow({
            width: 800,
            height: 375,
            backgroundColor: '#dfecde',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            x: winBounds["x"] + 100,
            y: winBounds["y"] + 100,
            resizable: false,
            parent: win,
            modal: true
        });

        addr_win.loadURL(url.format({
            pathname: path.join(__dirname, '../templates/addrecipe.html'),
            protocol: 'file',
            slashes: true
        }));

        addr_win.on('closed', function() {
            addr_win = null;
        });

        addr_win.on('blur', function() {
            addr_win.close();
        });

        if(devTools)
        {
            addr_win.toggleDevTools();
        }
    }
    else
    {
        addr_win.focus();
    }
}

function saveData(fpath, data)
{
    dialog.showSaveDialog({
        title: 'Pasirinkite saugojimo vietą',
        defaultPath: path.join(__dirname, fpath),
        buttonLabel: 'Išsaugoti',
        filters: [
            {
                name: 'JSON Failai',
                extensions: ['json']
            }
        ],
        properties: []
    }).then(file => {
        if(!file.canceled)
        {
            fs.writeFileSync(file.filePath.toString(), JSON.stringify(data));
        }
    }).catch(err => {
        console.log(err);
    });
}

function loadData(which)
{
    dialog.showOpenDialog({
        title: 'Pasirinkite failą',
        defaultPath: '~',
        buttonLabel: 'Įkelti',
        filters: [
            {
                name: 'JSON Failai',
                extensions: ['json']
            }
        ],
    }).then(file => {
        if(!file.canceled)
        {
            let rChanged = false;
            if(which == "products")
            {
                let jf = path.join(path.dirname(__dirname), './src/extraResources', 'data.json');
                jsonData = JSON.parse(fs.readFileSync(file.filePaths[0]))
                fs.writeFileSync(jf, JSON.stringify(jsonData))
            }
            else if(which == "recipes")
            {
                let rjf = path.join(path.dirname(__dirname), './src/extraResources', 'recipes.json');
                recipeData = JSON.parse(fs.readFileSync(file.filePaths[0]))
                fs.writeFileSync(rjf, JSON.stringify(recipeData))
                rChanged = true;
            }
            win.webContents.send("sync-data", jsonData, recipeData, rChanged);
            if(dp_win) dp_win.webContents.send("sync-data", jsonData);
            if(up_win) dp_win.webContents.send("sync-data", jsonData);
            if(uc_win) dp_win.webContents.send("sync-data", jsonData);
            if(np_win) dp_win.webContents.send("sync-data", jsonData);
        }
    }).catch(err => {
        console.log(err);
    });
}

app.on('ready', () => {
    createWindow();
    setMainMenu();
});

ipcMain.on("addrecipe", function(event) {
    newAddRecipeWindow();
});

ipcMain.on("load-data", function(event, jData, rData) {
    jsonData = jData;
    recipeData = rData;
});

ipcMain.on("retrieve-data", function (event) {
    event.sender.send("finalize-data", jsonData);
});

ipcMain.on("retrieve-cc-data", function (event){
    event.sender.send("cc-data", tempData);
});

ipcMain.on("retrieve-recipes-data", function(event) {
    event.sender.send("recipe-data", recipeData);
});

ipcMain.on("recipe-added", function(event, data) {
    win.webContents.send("recipe-added", data);
    addr_win.close();
});

ipcMain.on("new-recipe-data", function(event, data) {
    recipeData = data;
});

ipcMain.on("recipe-file-add", function(event, data)
{
    recipeData.push(data);
    let rcpf = path.join(path.dirname(__dirname), './src/extraResources', 'recipes.json');
    fs.writeFileSync(rcpf, JSON.stringify(recipeData));
});

ipcMain.on("new-data", function(event, jData) {
    jsonData = jData;

    // SYNC WITH MAIN WINDOW
    win.webContents.send("sync-data", jData);

    // SYNC WITH DELETE WINDOW IF IT EXISTS
    if(dp_win)
    {
        dp_win.webContents.send("sync-data", jData);
    }

    // SYNC WITH UPDATE WINDOW IF IT EXISTS
    if(up_win)
    {
        up_win.webContents.send("sync-data", jData);
    }

    if(uc_win)
    {
        uc_win.webContents.send("sync-data", jData);
    }
    
    np_win.close();
});

ipcMain.on("delete-data", function(event, jData) {
    jsonData = jData;

    // SYNC WITH MAIN WINDOW
    win.webContents.send("sync-data", jData);

    // SYNC WITH NEW PRODUCT WINDOW IF IT EXISTS
    if(np_win)
    {
        np_win.webContents.send("sync-data", jData);
    }

    // SYNC WITH UPDATE PRODUCT WINDOW IF IT EXISTS
    if(up_win)
    {
        up_win.webContents.send("sync-data", jData);
    }

    if(uc_win)
    {
        uc_win.webContents.send("sync-data", jData);
    }
    
    dp_win.close();
});

ipcMain.on("update-data", function(event, data) {
    jsonData = data;

    // SYNC WITH MAIN WINDOW
    win.webContents.send("sync-data", data);

    // SYNC WITH NEW PRODUCT WINDOW IF IT EXISTS
    if(np_win)
    {
        np_win.webContents.send("sync-data", data);
    }

    // SYNC WITH DELETE PRODUCT WINDOW IF IT EXISTS
    if(dp_win)
    {
        dp_win.webContents.send("sync-data", data);
    }

    if(uc_win)
    {
        uc_win.webContents.send("sync-data", data);
    }
    
    up_win.close();
});

ipcMain.on("update-category", function(event, jData) {
    jsonData = jData;

    win.webContents.send("sync-data", jData);

    if(np_win)
    {
        np_win.webContents.send("sync-data", jData);
    }

    if(dp_win)
    {
        dp_win.webContents.send("sync-data", jData);
    }

    if(up_win)
    {
        up_win.webContents.send("sync-data", jData);
    }

    uc_win.close();
});