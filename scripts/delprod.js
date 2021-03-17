const ipcRendererDp = require('electron').ipcRenderer;

var jsonData;

function onLoad()
{
    ipcRendererDp.send("retrieve-data");
}

function onDropdownSelect()
{
    clear();

    let value = document.getElementById("cat-dropdown").value;

    if(value != "")
    {
        let parentEl = document.getElementById("content");
        let rowNo = 0;
        for(let prod in jsonData[value])
        {
            productRow(parentEl, rowNo, prod);
            rowNo++;
        }
        enableDelete();
        enableDelAllCb();
    }
    else
    {
        disableDelete();
        disableDelAllCb();
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
        enableDelete();
    }
    else
    {
        let allCbs = document.getElementsByClassName("prod-cb");
        for(let c of allCbs)
        {
            if(c.checked)
            {
                enableDelete();
                return;
            }
        }
        disableDelete();
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
    }
    else
    {
        for(let c of allCbs)
        {
            c.removeAttribute("disabled");
            c.checked = false;
        }
    }
}

function disableDelete()
{
    let btn = document.getElementById("dbtn");

    if(!btn.hasAttribute("disabled"))
    {
        btn.setAttribute("disabled", "true");
    }
}

function disableDelAllCb()
{
    let cb = document.getElementById("del-all-checkbox");

    if(!cb.hasAttribute("disabled"))
    {
        cb.setAttribute("disabled", true);
    }
}

function enableDelete()
{
    let btn = document.getElementById("dbtn");

    if(btn.hasAttribute("disabled"))
    {
        btn.removeAttribute("disabled");
    }
}

function enableDelAllCb()
{
    let cb = document.getElementById("del-all-checkbox");

    if(cb.hasAttribute("disabled"))
    {
        cb.removeAttribute("disabled");
    }
}

function completeDelete()
{
    let cat = document.getElementById("cat-dropdown");

    if(document.getElementById("del-all-checkbox").checked)
    {
        delete jsonData[cat.value];
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
                delete jsonData[cat.value][prod.innerHTML];
            }
        }
    }

    // update main data
    let fs = require("fs");
    let p = require("path");
    let jf = p.join(p.dirname(__dirname), './app/src/extraResources', 'data.json');
    fs.writeFileSync(jf, JSON.stringify(jsonData));

    ipcRendererDp.send("delete-data", jsonData);
}

ipcRendererDp.on("finalize-data", function(event, data)
{
    jsonData = data;

    let catDropdown = document.getElementById("cat-dropdown");
    catDropdown.appendChild(createOption(""));
    for(let cat in data)
    {
        let opt = createOption(cat);
        catDropdown.appendChild(opt);
    }
});

ipcRendererDp.on("sync-data", function(event, data)
{
    jsonData = data;

    let dropdown = document.getElementById("cat-dropdown");
    let curVal = dropdown.value;

    removeAllChildNodes(cat-dropdown);

    dropdown.appendChild(createOption(""));
    let newVal = "";
    for(let cat of data)
    {
        dropdown.appendChild(createOption(cat));
        if(curVal == cat)
        {
            newVal = cat;
        }
    }
    dropdown.value = newVal;

    onDropdownSelect();
});