const ipcRendererDp = require('electron').ipcRenderer;

var jsonData;

var curCatVal = "";

function onLoad()
{
    ipcRendererDp.send("retrieve-data");
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
    let splitId = onCatDropdownButtonClick(id);
    if(splitId)
    {
        curCatVal = splitId[0];
        
        clear();
        let parentEl = document.getElementById("content");
        let prodArray = [];
        for(let prod in jsonData[curCatVal])
        {
            prodArray.push(prod);
        }
        prodArray.sort();

        for(let i = 0; i < prodArray.length; ++i)
        {
            productRow(parentEl, i, prodArray[i]);
        }
        enableDisableElement("del-all-checkbox", false);
    }
}

function productRow(parentEl, rowNo, value)
{
    let row = createContainer("row");

    let rowNoStr = rowNo.toString();

    let prodCont = createContainer("product-container");
    let cbCont = createContainer("checkbox-container");

    let prodEl = document.createElement("b");
    prodEl.setAttribute("id", "prod-" + rowNoStr);
    prodEl.appendChild(document.createTextNode(value));
    prodCont.appendChild(prodEl);

    let checkboxEl = document.createElement("input")
    checkboxEl.setAttribute("type", "checkbox");
    checkboxEl.setAttribute("id", "cb-" + rowNoStr);
    checkboxEl.setAttribute("oninput", "onCheck(" + rowNoStr + ");");
    checkboxEl.setAttribute("class", "prod-cb");
    cbCont.appendChild(checkboxEl);

    row.append(prodCont);
    row.append(cbCont);

    parentEl.append(row);
}

function clear()
{
    let content = document.getElementById("content");
    removeAllChildNodes(content);
}

function onCheck(rowNo)
{
    let cb = document.getElementById("cb-" + rowNo);
    if(cb.checked)
    {
        enableDisableElement("dbtn", false);
    }
    else
    {
        let allCbs = document.getElementsByClassName("prod-cb");
        for(let c of allCbs)
        {
            if(c.checked)
            {
                enableDisableElement("dbtn", false);
                return;
            }
        }
        enableDisableElement("dbtn", true);
    }
}

function onDeleteAllCheck()
{
    let allCbs = document.getElementsByClassName("prod-cb");
    let delAllCb = document.getElementById("del-all-checkbox");

    if(delAllCb.checked)
    {
        for(let c of allCbs)
        {
            c.checked = true;
            c.setAttribute("disabled", "true");
        }
        enableDisableElement("dbtn", false);
    }
    else
    {
        for(let c of allCbs)
        {
            c.removeAttribute("disabled");
            c.checked = false;
        }
        enableDisableElement("dbtn", true);
    }
}

function completeDelete()
{
    if(document.getElementById("del-all-checkbox").checked)
    {
        delete jsonData[curCatVal];
    }
    else
    {
        let rows = document.getElementsByClassName("row");

        for(let r of rows)
        {
            let cbCont = r.getElementsByClassName("checkbox-container")[0];
            let cb = cbCont.getElementsByClassName("prod-cb")[0];
            if(cb.checked)
            {
                let prodCont = r.getElementsByClassName("product-container")[0];
                let prod = prodCont.getElementsByTagName("b")[0];
                delete jsonData[curCatVal][prod.innerHTML];
            }
        }
    }

    // update main data
    let fs = require("fs");
    let p = require("path");
    let jf = p.join(p.dirname(__dirname), './src/extraResources', 'data.json');
    fs.writeFileSync(jf, JSON.stringify(jsonData));

    ipcRendererDp.send("delete-data", jsonData);
}

ipcRendererDp.on("finalize-data", function(event, data)
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

ipcRendererDp.on("sync-data", function(event, jData)
{
    jsonData = jData;

    let dropdown = document.getElementById("category-dropdown-0");
    let options = document.getElementById("category-options-0");
    dropdown.value = "";

    let btns = options.getElementsByClassName("dropdown-btn selected-btn");
    let currentlySelected = "";
    if(btns.length > 0)
    {
        currentlySelected = btns[0].innerHTML;
    }

    removeAllChildNodes(options);

    let counter = 0;
    let id = "";
    for(let cat in jsonData)
    {
        let tempId = insertDropdownButton(options, cat, "0", counter, "cat");
        if(currentlySelected == cat)
        {
            id = tempId;
        }
        counter++;
    }
    dropdown.value = currentlySelected;
    if(id != "")
    {
        clear();
        let parentEl = document.getElementById("content");
        let rowNo = 0;
        for(let prod in jsonData[curCatVal])
        {
            productRow(parentEl, rowNo, prod);
            rowNo++;
        }
        enableDisableElement("dbtn", true);
        enableDisableElement("del-all-checkbox", false);
    }
    else
    {
        clear();
    }
});