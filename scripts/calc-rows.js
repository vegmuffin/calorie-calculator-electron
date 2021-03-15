var curRow = 0;

const ipcRendererCc = require('electron').ipcRenderer;

function addRow()
{
    curRow++;
    var curRowStr = curRow.toString();

    var mainDiv = document.createElement("div");
    mainDiv.setAttribute("id", "calory" + curRowStr);
    mainDiv.setAttribute("class", "row");

    // CATEGORY DROPDOWN
    // Main structure
    var catContainer = createContainer("category-container")
    var catLabel = createLabel("category-dropdown-" + curRowStr, "Kategorija: ")

    // Add dropdown itself
    var catDropdown = document.createElement("select")
    catDropdown.setAttribute("name", "category-dropdown");
    catDropdown.setAttribute("id", "category-dropdown-" + curRowStr);
    catDropdown.setAttribute("onchange", "catDropdownSelect(" + curRow + ")");

    catDropdown.appendChild(createOption(""));

    // Populate with data
    for(var cat in jsonData)
    {
        catDropdown.appendChild(createOption(cat));
    }
    mainDiv = treeAdd(mainDiv, catContainer, catLabel, catDropdown);

    // PRODUCT DROPDOWN
    var prodContainer = createContainer("product-container")
    var prodLabel = createLabel("product-dropdown-" + curRowStr, "Produktas: ")
    var prodDropdown = document.createElement("select");
    prodDropdown.setAttribute("name", "product-dropdown");
    prodDropdown.setAttribute("id", "product-dropdown-" + curRowStr);
    prodDropdown.setAttribute("disabled", "true");
    prodDropdown.setAttribute("onchange", "prodDropdownSelect(" + curRowStr + ")");

    // Add the first empty dropdown option
    prodDropdown.appendChild(createOption(""));
    
    mainDiv = treeAdd(mainDiv, prodContainer, prodLabel, prodDropdown);

    // AMOUNT INPUT
    var amountContainer = createContainer("amount-container");
    var amountLabel = createLabel("amount-" + curRowStr, "Kiekis (g): ");
    var input = document.createElement("input");
    input.setAttribute("id", "amount-" + curRowStr);
    input.setAttribute("size", "10");
    input.setAttribute("disabled", "true");
    input.setAttribute("oninput", "amountChange(" + curRowStr + ")");
    mainDiv = treeAdd(mainDiv, amountContainer, amountLabel, input);

    // CALORIES
    var calContainer = createContainer("cal-container");
    var calLabel = createLabel("cal-" + curRowStr, "KCAL: ");
    var calText = document.createElement("b");
    calText.setAttribute("id", "cal-" + curRowStr);
    calText.appendChild(document.createTextNode("-"))
    mainDiv = treeAdd(mainDiv, calContainer, calLabel, calText);

    // CARBS
    var carbContainer = createContainer("carb-container");
    var carbLabel = createLabel("carb-" + curRowStr, "Anglv.: ");
    var carbText = document.createElement("b");
    carbText.setAttribute("id", "carb-" + curRowStr);
    carbText.appendChild(document.createTextNode("-"))
    mainDiv = treeAdd(mainDiv, carbContainer, carbLabel, carbText);

    // PROTS
    var protContainer = createContainer("prot-container");
    var protLabel = createLabel("prot-" + curRowStr, "Balt.: ");
    var protText = document.createElement("b");
    protText.setAttribute("id", "prot-" + curRowStr);
    protText.appendChild(document.createTextNode("-"))
    mainDiv = treeAdd(mainDiv, protContainer, protLabel, protText);

    // FATS
    var fatContainer = createContainer("fat-container");
    var fatLabel = createLabel("fat-" + curRowStr, "Rieb.: ");
    var fatText = document.createElement("b");
    fatText.setAttribute("id", "fat-" + curRowStr);
    fatText.appendChild(document.createTextNode("-"))
    mainDiv = treeAdd(mainDiv, fatContainer, fatLabel, fatText);

    // DELETE BUTTON
    var deleteContainer = createContainer("delete-row-container");
    var deleteBtn = document.createElement("button");

    // IMG
    var img = document.createElement("img");
    img.setAttribute("src", "imgs/minus_icon.png");
    img.setAttribute("class", "delrow-img");
    deleteBtn.appendChild(img);
    
    deleteBtn.setAttribute("class", "delete-row");
    deleteBtn.setAttribute("id", "delete-row-" + curRowStr);
    deleteBtn.setAttribute("onclick", "delRow(" + curRowStr + ")")
    deleteContainer.appendChild(deleteBtn);
    mainDiv.appendChild(deleteContainer);

    // Insert main
    var addRowBtn = document.getElementById("add-row-button");
    document.getElementById("calorycalc").insertBefore(mainDiv, addRowBtn);
}

function treeAdd(mainDiv, childContainer, label, el)
{
    childContainer.appendChild(label);
    childContainer.appendChild(el);
    mainDiv.appendChild(childContainer);
    return mainDiv;
}

function delRow(row)
{
    rowEl = document.getElementById("calory" + row)
    document.getElementById("calorycalc").removeChild(rowEl)
}

function catDropdownSelect(row)
{
    console.log(jsonData);
    var catDropdown = document.getElementById("category-dropdown-" + row);
    var prodDropdown = document.getElementById("product-dropdown-" + row);
    prodDropdown.removeAttribute("disabled");

    // Current category value
    var catValue = catDropdown.value;

    if(catValue == "")
    {
        prodDropdown.value = "";
        prodDropdown.setAttribute("disabled", "true");
        let inputField = document.getElementById("amount-" + row);
        inputField.value = "";
        inputField.setAttribute("disabled", "true");
        document.getElementById("cal-" + row).innerHTML = "-";
        document.getElementById("carb-" + row).innerHTML = "-";
        document.getElementById("prot-" + row).innerHTML = "-";
        document.getElementById("fat-" + row).innerHTML = "-";
        return;
    }
    
    removeAllChildNodes(prodDropdown);
    prodDropdown.appendChild(createOption(""));
    for(var prod in jsonData[catValue])
    {
        prodDropdown.appendChild(createOption(prod));
    }
}

function prodDropdownSelect(row)
{
    let cal = document.getElementById("cal-" + row);
    let carb = document.getElementById("carb-" + row);
    let prot = document.getElementById("prot-" + row);
    let fat = document.getElementById("fat-" + row);
    var amountField = document.getElementById("amount-" + row);

    if(document.getElementById("product-dropdown-" + row).value == "")
    {
        cal.innerHTML = "-";
        carb.innerHTML = "-";
        prot.innerHTML = "-";
        fat.innerHTML = "-";
        amountField.value = "";
        amountField.setAttribute("disabled", "true");
        return;
    }
    
    var prodData = getProdData(row);

    amountField.value = "100";
    amountField.removeAttribute("disabled");

    // Set nutrition values
    cal.innerHTML = prodData["cal"];
    carb.innerHTML = prodData["carb"];
    prot.innerHTML = prodData["prot"];
    fat.innerHTML = prodData["fat"];
}

function amountChange(row)
{
    var cal = document.getElementById("cal-" + row);
    var carb = document.getElementById("carb-" + row);
    var prot = document.getElementById("prot-" + row);
    var fat = document.getElementById("fat-" + row);

    inputField = document.getElementById("amount-" + row);
    if(inputField.value == "")
    {
        cal.innerHTML = "-";
        carb.innerHTML = "-";
        prot.innerHTML = "-";
        fat.innerHTML = "-";
        return;
    }

    if(checkInputValidity(inputField))
    {
        var prodData = getProdData(row);

        cal.innerHTML = (prodData["cal"] * parseInt(inputField.value)) / 100;
        carb.innerHTML = (prodData["carb"] * parseInt(inputField.value)) / 100;
        prot.innerHTML = (prodData["prot"] * parseInt(inputField.value)) / 100;
        fat.innerHTML = (prodData["fat"] * parseInt(inputField.value)) / 100;
    }
}

function getProdData(row)
{
    var catValue = document.getElementById("category-dropdown-" + row).value;
    var prodValue = document.getElementById("product-dropdown-" + row).value;
    return jsonData[catValue][prodValue];
}

ipcRendererCc.on("sync-data", function(event, data) {
    jsonData = data;

    // Update dropdowns
    let rows = document.getElementsByClassName("row");

    for(r of rows)
    {
        let conts = r.getElementsByTagName("div");

        // Need it defined in a wider scope for product dropdown to know the value
        let cDropdown;

        for(c of conts)
        {
            let cClass = c.getAttribute("class");
            
            if(cClass == "category-container")
            {
                cDropdown = c.getElementsByTagName("select")[0];
                let curValue = cDropdown.value;

                removeAllChildNodes(cDropdown);
                cDropdown.appendChild(createOption(""));
                for(let cat in data)
                {
                    cDropdown.appendChild(createOption(cat));
                }

                cDropdown.value = curValue;
                continue;
            }
            else if(cClass == "product-container")
            {
                let pDropdown = c.getElementsByTagName("select")[0];

                if(!pDropdown.hasAttribute("disabled"))
                {
                    let curValue = pDropdown.value;

                    removeAllChildNodes(pDropdown);
                    pDropdown.appendChild(createOption(""));
                    for(let prod in data[cDropdown.value])
                    {
                        pDropdown.appendChild(createOption(prod));
                    }

                    pDropdown.value = curValue;
                    continue;
                }
            }
        }
    }
});