const ipcRendererAddr = require('electron').ipcRenderer;

var recipeData;
var recipeNames = [];

function onLoad()
{
    ipcRendererAddr.send("retrieve-recipes-data");
}

function dropdownFilterAlt(id)
{
    dropdownFilter(id);
    doneCheck();
}

function onDropdownClick(id)
{
    let inputField = document.getElementById(id);
    inputField.select();
    let cls = inputField.getAttribute("class");
    if(!cls.includes("selected-input"))
    {
        cls += " selected-input";
        inputField.setAttribute("class", cls);
    }
    dropdownFilter(id);
}

function onCatClick(id)
{
    let _ = onCatDropdownButtonClick(id);
    document.getElementById("category-dropdown-0").value = document.getElementById(id).innerHTML;

    doneCheck();
}

function doneCheck()
{
    let catDropdown = document.getElementById("category-dropdown-0");
    let recipeNameInput = document.getElementById("recipe-name-input");

    let returnValue = true;
    if(catDropdown.value == "")
    {
         returnValue = false;
    }
    if(recipeNames.includes(recipeNameInput.value))
    {
        addTooltip(recipeNameInput, "Receptas jau egzistuoja");
        returnValue = false;
    }
    else
    {
        removeTooltip(recipeNameInput);
        if(recipeNameInput.value == "") returnValue = false;
    }
    if(returnValue) enableDisableElement("ubtn", false);
    else enableDisableElement("ubtn", true);
}

function done()
{
    let data = {};
    data["name"] = document.getElementById("recipe-name-input").value;
    data["category"] = document.getElementById("category-dropdown-0").value;
    data["description"] = document.getElementById("recipe-description").value;

    ipcRendererAddr.send("recipe-added", data);
}

ipcRendererAddr.on("recipe-data", function(event, data) {
    recipeData = data;
    let catOptions = document.getElementById("category-options-0");
    let recipeCategories = [];
    for(let i = 0; i < recipeData.length; ++i)
    {
        let rName = recipeData[i]["name"];
        let rCategory = recipeData[i]["category"];
        recipeNames.push(rName);

        if(!recipeCategories.includes(rCategory))
        {
            insertDropdownButton(catOptions, rCategory, "0", i, "cat");
            recipeCategories.push(rCategory);
        }
    }
});