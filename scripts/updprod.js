const ipcRendererUp = require('electron').ipcRenderer;

var jsonData;
var curCatVal = ""
var curProdVal = ""

var illegalFields = ["", "."]

function getData()
{
    ipcRendererUp.send("retrieve-data");
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
        populateProductDropdown(splitId);
        curCatVal = splitId[0];
    }
}

function onProdClick(id)
{
    let splitId = onProdDropdownButtonClick(id);
    if(splitId)
    {
        let content = document.getElementById("content");
        removeAllChildNodes(content);

        curProdVal = splitId[0];
        
        let row = createContainer("row");

        let prd = ""
        let keys = Object.keys(jsonData[curCatVal]);
        for(let i = 0; i < keys.length; ++i)
        {
            if(curProdVal == keys[i])
            {
                prd = keys[i];
                break;
            }
        }
        row.appendChild(createInput("up-prod-container", "prd", prd))
        row.appendChild(createInput("up-carb-container", "carb", replacedString(jsonData[curCatVal][curProdVal]["carb"])))
        row.appendChild(createInput("up-fat-container", "fat", replacedString(jsonData[curCatVal][curProdVal]["fat"])))
        row.appendChild(createInput("up-prot-container", "prot", replacedString(jsonData[curCatVal][curProdVal]["prot"])))
        row.appendChild(createInput("up-kcal-container", "kcal", replacedString(jsonData[curCatVal][curProdVal]["cal"])))
        row.appendChild(createInput("up-skaid-container", "skaid", replacedString(jsonData[curCatVal][curProdVal]["skaid"])))

        // updating a product name would be a huge headache
        //setTimeout(function() {
        //    document.getElementById("prd").setAttribute("disabled", "true");
        //}, 1);

        content.appendChild(row);

        canUpdate();
    }
}

function onProdInput(id)
{
    let inputField = document.getElementById(id);
    let intFields = document.getElementsByClassName("intfield");

    if(inputField.value != "")
    {
        for(let intField of intFields)
        {
            if(intField.hasAttribute("disabled"))
            {
                intField.removeAttribute("disabled");
            }
        }
    }
    else
    {
        for(let intField of intFields)
        {
            if(!intField.hasAttribute("disabled"))
            {
                intField.setAttribute("disabled", "true");
            }
        }
    }

    canUpdate();
}

function onIntInput(id)
{
    let inputField = document.getElementById(id);
    checkInputValidity(inputField);

    canUpdate();
}

function canUpdate()
{
    let able = true;

    if(curCatVal == "" || curProdVal == "")
    {
        able = false;
    }
    else
    {
        let allInputs = document.getElementsByTagName("input");
        for(let input of allInputs)
        {
            if(input.value == "")
            {
                if(input.className.includes("intfield"))
                {
                    if(illegalFields.includes(input.value))
                    {
                        able = false;
                    }
                }
                else
                {
                    able = false;
                }
            }

            // product field
            if(input.getAttribute("class") != "intfield")
            {
                for(let prod in jsonData[curCatVal])
                {
                    if(input.value == prod && input.value != curProdVal)
                    {
                        addTooltip(input, "Produktas jau egzistuoja");
                        able = false;
                        break;
                    }
                    else
                    {
                        removeTooltip(input);
                    }
                }
            }
        }
    }

    
    if(able)
    {
        enableDisableElement("ubtn", false);
    }
    else
    {
        enableDisableElement("ubtn", true);
    }
}

function update()
{
    delete jsonData[curCatVal][curProdVal];

    let prod = document.getElementById("prd").value;
    let cal = document.getElementById("kcal").value;
    let carb = document.getElementById("carb").value;
    let prot = document.getElementById("prot").value;
    let fat = document.getElementById("fat").value;
    let skaid = document.getElementById("skaid").value;

    let prodObj = {
        "cal": parseFloatComma(cal),
        "carb": parseFloatComma(carb),
        "prot": parseFloatComma(prot),
        "fat": parseFloatComma(fat),
        "skaid": parseFloatComma(skaid)
    }

    jsonData[curCatVal][prod] = prodObj;

    // update main data
    let fs = require("fs");
    let p = require('path');
    let jf = p.join(p.dirname(__dirname), './src/extraResources/', 'data.json');
    fs.writeFileSync(jf, JSON.stringify(jsonData));

    ipcRendererUp.send("update-data", jsonData);
}

ipcRendererUp.on("finalize-data", function(event, data) {
    jsonData = data;

    let cDropdown = document.getElementById("category-options-0");

    let counter = 0;
    for(let cat in jsonData)
    {
        insertDropdownButton(cDropdown, cat, "0", counter, "cat");
        counter++;
    }
});

ipcRendererUp.on("sync-data", function(event, data) {
    jsonData = data;

    let content = document.getElementById("content");
    removeAllChildNodes(content);

    curCatVal = "";
    curProdVal = "";

    // TODO -> populate with different values
    let catOptions = document.getElementById("category-options-0");
    let prodOptions = document.getElementById("product-options-0");
    removeAllChildNodes(prodOptions);
    removeAllChildNodes(catOptions);

    let counter = 0;
    for(let cat in data)
    {
        insertDropdownButton(catOptions, cat, "0", counter, "cat");
        counter++;
    }

    enableDisableElement("ubtn", "true");

    let cId = "category-dropdown-0";
    let pId = "product-dropdown-0";
    document.getElementById(pId).value = "";
    document.getElementById(cId).value = "";
    enableDisableElement(pId, true);
});