const ipcRendererUp = require('electron').ipcRenderer;

var jsonData;
var curCatVal = ""
var curProdVal = ""

function getData()
{
    ipcRendererUp.send("retrieve-data");
}

function onCategorySelect()
{
    let catDropdown = document.getElementById("cat-dropdown");

    if(catDropdown.value != "")
    {
        enableDisableElement("prod-dropdown", false)
        populateProducts(catDropdown.value);
    }
    else
    {
        removeAllChildNodes(document.getElementById("prod-dropdown"));
        enableDisableElement("prod-dropdown", true);
    }
}

function populateProducts(cat)
{
    if(curCatVal == cat)
    {
        return;
    }
    else
    {
        curCatVal = cat;
        curProdVal = "";
    }

    let prodDropdown = document.getElementById("prod-dropdown");
    removeAllChildNodes(prodDropdown);
    prodDropdown.appendChild(createOption(""));

    for(let prod in jsonData[cat])
    {
        prodDropdown.appendChild(createOption(prod));
    }
}

function onProductSelect()
{
    console.log(jsonData[curCatVal]);
    let prodDropdown = document.getElementById("prod-dropdown");
    if(prodDropdown.value == curProdVal)
    {
        return;
    }
    else
    {
        curProdVal = prodDropdown.value;
    }

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
    row.appendChild(createInput("up-prod-container", "prd", "Produktas: ", prd))
    row.appendChild(createInput("up-kcal-container", "kcal", "KCAL/100g: ", jsonData[curCatVal][curProdVal]["cal"]))
    row.appendChild(createInput("up-carb-container", "carb", "Anglv./100g: ", jsonData[curCatVal][curProdVal]["carb"]))
    row.appendChild(createInput("up-prot-container", "prot", "Balt./100g: ", jsonData[curCatVal][curProdVal]["prot"]))
    row.appendChild(createInput("up-fat-container", "fat", "Rieb./100g: ", jsonData[curCatVal][curProdVal]["fat"]))

    document.getElementById("content").appendChild(row);

    canUpdate();
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
                able = false;
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

    let prodObj = {
        "cal": parseInt(cal),
        "carb": parseInt(carb),
        "prot": parseInt(prot),
        "fat": parseInt(fat)
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

    let cDropdown = document.getElementById("cat-dropdown");
    cDropdown.appendChild(createOption(""));

    for(cat in jsonData)
    {
        cDropdown.appendChild(createOption(cat));
    }
});

ipcRendererUp.on("sync-data", function(event, data) {
    jsonData = data;

    let content = document.getElementById("content");
    removeAllChildNodes(content);

    curCatVal = "";
    curProdVal = "";

    // TODO -> populate with different values
    let catDropdown = document.getElementById("cat-dropdown");
    let prodDropdown = document.getElementById("prod-dropdown");
    removeAllChildNodes(prodDropdown);
    removeAllChildNodes(catDropdown);

    catDropdown.appendChild(createOption(""));
    for(let cat in data)
    {
        catDropdown.appendChild(createOption(cat));
    }

    enableDisableElement("ubtn", "true");
});