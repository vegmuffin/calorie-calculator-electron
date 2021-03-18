const fs = require('fs');
const ipcRenderer = require('electron').ipcRenderer;
const p = require('path');

var jsonData;

const jsonFile = p.join(p.dirname(__dirname), './src/extraResources', 'data.json');

function loadData()
{
    console.log(jsonFile);
    var rawData = fs.readFileSync(jsonFile);
    jsonData = JSON.parse(rawData);

    var catDropdown = document.getElementById("category-dropdown-0");
    for(var cat in jsonData)
    {
        var childOption = document.createElement("option");
        childOption.setAttribute("value", cat);
        childOption.appendChild(document.createTextNode(cat));
        catDropdown.appendChild(childOption);
    }

    ipcRenderer.send("load-data", jsonData);
}

