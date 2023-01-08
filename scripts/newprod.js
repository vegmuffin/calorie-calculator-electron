var nc_curRow = 0;
const ipcRendererNp = require('electron').ipcRenderer;
const remote = require('electron').remote;

var jsonData;
var emojiData;

var currentCat = "";
var checkboxValue = false;

var illegalFields = ["", "."]

function addRow()
{
    nc_curRow++;
    nc_curRowStr = nc_curRow.toString();

    var mainDiv = document.createElement("div");
    mainDiv.setAttribute("id", "np-" + nc_curRowStr);
    mainDiv.setAttribute("class", "np-row");

    mainDiv.appendChild(createInput("np-product-container", "np-product-" + nc_curRowStr, ""));
    mainDiv.appendChild(createInput("np-carb-container", "np-carb-" + nc_curRowStr, ""));
    mainDiv.appendChild(createInput("np-fat-container", "np-fat-" + nc_curRowStr, ""));
    mainDiv.appendChild(createInput("np-prot-container", "np-prot-" + nc_curRowStr, ""));
    mainDiv.appendChild(createInput("np-kcal-container", "np-kcal-" + nc_curRowStr, ""));
    mainDiv.appendChild(createInput("np-skaid-container", "np-skaid-" + nc_curRowStr, ""));

    var delContainer = createContainer("np-del-container");
    var delBtn = document.createElement("button");
    var img = document.createElement("img");
    img.setAttribute("src", "../imgs/minus_icon.png");
    img.setAttribute("class", "delrow-img");
    delBtn.appendChild(img);

    delBtn.setAttribute("class", "np-delrow");
    delBtn.setAttribute("id", "delrow-" + nc_curRowStr);
    delBtn.setAttribute("onclick", "delRow(" + nc_curRowStr + ")");

    delContainer.append(delBtn);
    mainDiv.appendChild(delContainer);

    // Insert
    var btns = document.getElementById("np-btns");
    document.body.insertBefore(mainDiv, btns);

    document.getElementById("np-done-btn").setAttribute("disabled", "true");
}

function onIntInput(id)
{
    let inputField = document.getElementById(id);
    checkInputValidity(inputField);

    doneCheck("np", nc_curRow);
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

function onProdInput(id)
{
    let inputField = document.getElementById(id);

    let splitId = id.split("-");
    let intFields = getNumberFields("np", splitId[splitId.length-1]);

    if(inputField.value != "")
    {
        for(i = 0; i < intFields.length; i++)
        {
            intFields[i].removeAttribute("disabled");
        }
    }
    else
    {
        for(let i = 0; i < intFields.length; i++)
        {
            intFields[i].setAttribute("disabled", "true");
        }
    }

    doneCheck("np", nc_curRow);
}

function onNewcatInput()
{
    currentCat = document.getElementById("np-newcat-input").value;
    doneCheck("np", nc_curRow);
}

function delRow(row)
{
    nc_curRow--;

    // Find row
    let rowToDel = document.getElementById("np-" + row);
    document.body.removeChild(rowToDel);

    const elems = document.body.getElementsByTagName("*");
    for(let i = 0; i < elems.length; i++){
        let element = elems[i];

        let splitId = element.id.split("-");
        let lastNo = splitId[splitId.length - 1];

        // Filter garbage
        if(isNumeric(lastNo))
        {
            // Get everything that is below the row
            let lastNoInt = parseInt(lastNo);
            let rowInt = parseInt(row);
            if(lastNoInt > rowInt)
            {
                let newNo = --lastNoInt;
                splitId[splitId.length - 1] = newNo.toString();
                let newId = splitId.join("-");
                element.setAttribute("id", newId);

                // Handle inputs and buttons
                if(element.tagName == "button".toUpperCase())
                {
                    let onClick = element.getAttribute("onclick");
                    let newOnClick = onClick.replace(lastNo, newNo.toString());
                    element.setAttribute("onclick", newOnClick);
                }
            }
        }
    }

    doneCheck();
}

function populateCategories()
{
    ipcRendererNp.send("retrieve-data");
    ipcRendererNp.send("retrieve-emoji-data");
}

function onCatClick(id)
{
    let splitId = onCatDropdownButtonClick(id);
    if(splitId)
    {
        currentCat = splitId[0];

        let e = document.getElementById("emoji-0");
        e.innerHTML = emojiData[currentCat];

        doneCheck("np", nc_curRow);
    }
}

function containsProduct(prod, category)
{
    for(product in jsonData[category])
    {
        if(prod == product)
        {
            return true;
        }
    }
    return false;
}

function containsDuplicate(prefix, inputField, rowCount)
{
    var inputFieldId = inputField.getAttribute("id");
    for(let i = 0; i <= rowCount; i++)
    {
        let fieldId = prefix + "-product-" + i.toString();

        // ignore comparison with itself
        if(fieldId != inputFieldId)
        {
            var compareField = document.getElementById(fieldId);
            if(compareField.value == inputField.value)
            {
                return true;
            }
        }
    }
    return false;
}

function getNumberFields(prefix, row)
{
    var fields = [];
    fields.push(document.getElementById(prefix + "-kcal-" + row));
    fields.push(document.getElementById(prefix + "-carb-" + row));
    fields.push(document.getElementById(prefix + "-prot-" + row));
    fields.push(document.getElementById(prefix + "-fat-" + row));
    fields.push(document.getElementById(prefix + "-skaid-" + row));
    return fields;
}

function onCheckbox()
{
    let checkbox = document.getElementById("np-checkbox");
    checkboxValue = checkbox.checked;

    let dropdown = document.getElementById("category-dropdown-0");
    let newcatInput = document.getElementById("np-newcat-input");

    if(checkboxValue)
    {
        dropdown.setAttribute("disabled", "true");
        newcatInput.removeAttribute("disabled");
        currentCat = newcatInput.value;
        enableDisableElement("ebtn", false);
    }
    else
    {
        dropdown.removeAttribute("disabled");
        newcatInput.setAttribute("disabled", "true");
        let opt = document.getElementById("category-options-0");
        let btns = opt.getElementsByClassName("dropdown-btn selected-btn");
        if(btns.length > 0)
        {
            currentCat = btns[0].innerHTML;
        }
        else
        {
            currentCat = "";
        }
        enableDisableElement("ebtn", true);
    }

    doneCheck("np", nc_curRow);
}

function highlightRow(rowNo)
{
    let row = document.getElementById("np-" + rowNo);
    let rDivs = row.getElementsByTagName("div");
    for(let d of rDivs)
    {
        let dClass = d.getAttribute("class");
        if(dClass.includes("highlighted"))
        {
            // already highlighted
            return;
        }
        else if(!dClass.includes("del"))
        {
            let newClass = dClass + " highlighted";
            d.setAttribute("class", newClass);
        }
    }

    let otherRows = document.getElementsByClassName("np-row");
    for(let r of otherRows)
    {
        if(r.getAttribute("id").includes(rowNo))
        {
            continue;
        }
        let rDivs = r.getElementsByTagName("div");
        let highlighted = false;
        for(let d of rDivs)
        {
            let dClass = d.getAttribute("class");
            if(dClass.includes("highlighted"))
            {
                // this row was previously highlighted
                highlighted = true;
                let splitClass = dClass.split(" ");
                d.setAttribute("class", splitClass[0]);
            }
            else
            {
                // it's not this row
                break;
            }
        }
        if(highlighted)
        {
            // took care of the highlighted section
            return;
        }
    }
}

function doneCheck(prefix, rowCount)
{
    let doneButton = document.getElementById("np-done-btn");
    if(canSubmit(prefix, rowCount))
    {
        doneButton.removeAttribute("disabled");
    }
    else
    {
        doneButton.setAttribute("disabled", "true")
    }
}

function canSubmit(prefix, rowCount)
{
    var returnValue = true;

    if(checkboxValue)
    {
        let newcatInput = document.getElementById(prefix + "-newcat-input");
        if(newcatInput.value != "")
        {
            for(cat in jsonData)
            {
                if(newcatInput.value.toUpperCase() == cat.toUpperCase())
                {
                    // category already exists
                    addTooltip(newcatInput, "Kategorija jau egzistuoja")
                    returnValue = false;
                    break;
                }
                else
                {
                    removeTooltip(newcatInput);
                }
            }
        }
        else
        {
            returnValue = false;
        }
    }
    else if(currentCat == "")
    {   
        returnValue = false;
    }

    for(let i = 0; i <= rowCount; ++i)
    {
        let iterStr = i.toString();
        let prodField = document.getElementById(prefix + "-product-" + iterStr);
        let kcalField = document.getElementById(prefix + "-kcal-" + iterStr);
        let carbField = document.getElementById(prefix + "-carb-" + iterStr);
        let protField = document.getElementById(prefix + "-prot-" + iterStr);
        let fatField = document.getElementById(prefix + "-fat-" + iterStr);
        let skaidField = document.getElementById(prefix + "-skaid-" + iterStr);


        if(prodField.value != "")
        {
            if(!checkboxValue && containsProduct(prodField.value, currentCat))
            {
                addTooltip(prodField, "Produktas kategorijoje jau yra");
                returnValue = false;
            }
            else if(containsDuplicate("np", prodField, nc_curRow))
            {
                addTooltip(prodField, "Produktas dubliuojasi")
                returnValue = false;
            }
            else
            {
                // all good, remove tooltip if needed
                removeTooltip(prodField);
            }
        }
        else
        {
            returnValue = false;
        }

        if(illegalFields.includes(kcalField.value) || illegalFields.includes(carbField.value) || 
           illegalFields.includes(protField.value) || illegalFields.includes(fatField.value) || 
           illegalFields.includes(skaidField.value))
        {
            returnValue = false;
        }

    }

    return returnValue;
}

function done(prefix)
{
    nc_curRow = 0;

    let rows = document.getElementsByClassName(prefix + "-row");

    let fs = require("fs");
    let p = require("path");
    let ejf = p.join(p.dirname(__dirname), './src/extraResources', 'emojis.json');

    // Create new category
    if(checkboxValue)
    {
        jsonData[currentCat] = {};

        let newEmoji = document.getElementById("ebtn").innerHTML;
        emojiData[currentCat] = newEmoji;
        fs.writeFileSync(ejf, JSON.stringify(emojiData));
    }

    for(r of rows)
    {
        let conts = r.getElementsByTagName("div");

        let prodName = "";
        let kcal = 0;
        let carb = 0;
        let prot = 0;
        let fat = 0;
        let skaid = 0;

        for(c of conts)
        {
            let cClass = c.getAttribute("class");

            // Handle new prod name
            if(cClass.includes(prefix + "-product-container"))
            {
                prodName = c.getElementsByTagName("input")[0].value;
            }
            else if(cClass.includes(prefix + "-kcal-container"))
            {
                kcal = parseFloat(c.getElementsByTagName("input")[0].value);
            }
            else if(cClass.includes(prefix + "-carb-container"))
            {
                carb = parseFloat(c.getElementsByTagName("input")[0].value);
            }
            else if(cClass.includes(prefix + "-prot-container"))
            {
                prot = parseFloat(c.getElementsByTagName("input")[0].value);
            }
            else if(cClass.includes(prefix + "-fat-container"))
            {
                fat = parseFloat(c.getElementsByTagName("input")[0].value);
            }
            else if(cClass.includes(prefix + "-skaid-container"))
            {
                skaid = parseFloat(c.getElementsByTagName("input")[0].value);
            }
        }

        let dict = {
            "cal": kcal,
            "carb": carb,
            "prot": prot,
            "fat": fat,
            "skaid": skaid
        }
        jsonData[currentCat][prodName] = dict;
    }

    // update main data
    let jf = p.join(p.dirname(__dirname), './src/extraResources/', 'data.json');
    fs.writeFileSync(jf, JSON.stringify(jsonData));

    ipcRendererNp.send("new-data", jsonData, emojiData);
}

ipcRendererNp.on("finalize-data", function(event, jData) {
    jsonData = jData;
    
    let options = document.getElementById("category-options-0");

    let counter = 0;
    for(let cat in jsonData)
    {
        insertDropdownButton(options, cat, "0", counter, "cat");
        counter++;
    }

    document.querySelector('emoji-picker')
        .addEventListener('emoji-click', event => onEmojiSelect(event.detail)); 
});

ipcRendererNp.on("emoji-data", function(event, eData) {
    emojiData = eData;
});

ipcRendererNp.on("sync-data", function(event, jData, eData) {
    jsonData = jData;
    emojiData = eData;

    let options = document.getElementById("category-options-0");
    let btns = options.getElementsByClassName("dropdown-btn selected-btn");
    let currentlySelected = "";
    if(btns.length > 0)
    {
        currentlySelected = btns[0].innerHTML;
    }
    removeAllChildNodes(options);

    let id = "";
    let counter = 0;
    for(let cat in jsonData)
    {
        let tempId = insertDropdownButton(options, cat, "0", counter, "cat");
        if(cat == currentlySelected)
        {
            id = tempId;
        }
    }

    if(!(currentCat in jsonData))
    {
        document.getElementById("category-dropdown-0").value = "";
        let e = document.getElementById("emoji-0");
        e.innerHTML = "";
    }

    if(id != "" && currentlySelected != "")
    {
        let e = document.getElementById("emoji-0");
        e.innerHTML = emojiData[currentCat];
        onCatClick(id);
    }
    else
    {
        doneCheck();
    }
});