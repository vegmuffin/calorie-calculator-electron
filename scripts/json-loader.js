const fs = require('fs');
const ipcRenderer = require('electron').ipcRenderer;
const p = require('path');

var jsonData;
var recipeData;

const jsonFile = p.join(p.dirname(__dirname), './src/extraResources', 'data.json');
const recipeFile = p.join(p.dirname(__dirname), './src/extraResources', 'recipes.json');

function loadData()
{
    var rawData = fs.readFileSync(jsonFile);
    jsonData = JSON.parse(rawData);

    recipeData = JSON.parse(fs.readFileSync(recipeFile));

    var catDropdown = document.getElementById("category-options-0");
    let counter = 0;
    for(var cat in jsonData)
    {
        insertDropdownButton(catDropdown, cat, "0", counter, "cat");
        counter++;
    }

    populateRecipes();

    ipcRenderer.send("load-data", jsonData, recipeData);
}

