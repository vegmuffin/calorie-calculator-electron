const ipcRendererUc = require('electron').ipcRenderer;

var jsonData;

var curCatVal = "";

function onLoad()
{
    ipcRendererUc.send("retrieve-data");
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
    let splitId = onCatDropdownButtonClick(id)
    if(splitId)
    {
        curCatVal = splitId[0];
        enableDisableElement("newname-input", false);
        document.getElementById("newname-input").value = curCatVal;

        doneCheck();
    }
}

function doneCheck()
{
    let returnValue = true;
    let newnameInput = document.getElementById("newname-input");
    if(curCatVal == "" || newnameInput.value == "")
    {
        returnValue = false;
    }
    else if(newnameInput.value in jsonData && newnameInput.value != curCatVal)
    {
        returnValue = false;
        addTooltip(newnameInput, "Kategorija jau egzistuoja");
    }

    if(returnValue)
    {
        enableDisableElement("ubtn", false);
    }
    else
    {
        enableDisableElement("ubtn", true);
    }
}

function complete()
{
    let fs = require("fs");
    let p = require("path");

    let newname = document.getElementById("newname-input").value;

    if(newname != curCatVal)
    {
        Object.defineProperty(jsonData, newname, Object.getOwnPropertyDescriptor(jsonData, curCatVal));
        delete jsonData[curCatVal];
        let jf = p.join(p.dirname(__dirname), './src/extraResources', 'data.json');
        fs.writeFileSync(jf, JSON.stringify(jsonData));

        ipcRendererUc.send("update-category", jsonData);
    }

    ipcRendererUc.send("update-category", jsonData);
}

ipcRendererUc.on("finalize-data", function(event, data)
{
    jsonData = data;

    let opt = document.getElementById("category-options-0");
    let counter = 0;
    for(let cat in data)
    {
        insertDropdownButton(opt, cat, "0", counter, "cat");
        counter++;
    }
});

ipcRendererUc.on("sync-data", function (event, jData)
{
    jsonData = jData;
    let opt = document.getElementById("category-options-0");
    let drop = document.getElementById("category-dropdown-0");
    drop.value = "";

    let btns = opt.getElementsByClassName("dropdown-btn selected-btn");
    let currentlySelected = "";
    if(btns.length > 0)
    {
        currentlySelected = btns[0].innerHTML;
    }
    removeAllChildNodes(opt);

    let counter = 0;
    let id = "";
    for(let cat in jData)
    {
        let tempId = insertDropdownButton(options, cat, "0", counter, "cat");
        if(currentlySelected == cat)
        {
            id = tempId;
        }
        counter++;
    }
    drop.value = currentlySelected;
    if(id != "")
    {
        onCatClick(id);
    }
    else
    {
        let newnameInput = document.getElementById("newname-input");
        newnameInput.value = "";
        enableDisableElement("newname-input", true);
        curCatVal = "";
    }
});