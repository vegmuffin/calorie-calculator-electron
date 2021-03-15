var nc_curRow = 0;
const ipcRendererNp = require('electron').ipcRenderer;
const remote = require('electron').remote;

var jsonData;
var currentCat = "";
var checkboxValue = false;

function addRow()
{
    nc_curRow++;
    nc_curRowStr = nc_curRow.toString();

    var mainDiv = document.createElement("div");
    mainDiv.setAttribute("id", "np-" + nc_curRowStr);
    mainDiv.setAttribute("class", "np-row");

    mainDiv.appendChild(createInput("np-product-container", "np-product-" + nc_curRowStr, "Produktas: "));
    mainDiv.appendChild(createInput("np-kcal-container", "np-kcal-" + nc_curRowStr, "KCAL/100g: "));
    mainDiv.appendChild(createInput("np-carb-container", "np-carb-" + nc_curRowStr, "Anglv./100g: "));
    mainDiv.appendChild(createInput("np-prot-container", "np-prot-" + nc_curRowStr, "Balt./100g: "));
    mainDiv.appendChild(createInput("np-fat-container", "np-fat-" + nc_curRowStr, "Rieb./100g: "));

    var delContainer = createContainer("np-del-container");
    var delBtn = document.createElement("button");
    var img = document.createElement("img");
    img.setAttribute("src", "imgs/minus_icon.png");
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

function createInput(containerClass, id, labelText)
{
    var cont = createContainer(containerClass);
    var label = createLabel(id, labelText);
    var input = document.createElement("input");

    input.setAttribute("id", id);
    if(containerClass != "np-product-container")
    {
        input.setAttribute("size", "5");
        input.setAttribute("oninput", "onIntInput('" + id + "');");
        input.setAttribute("disabled", "true");
    }
    else
    {
        console.log("id: " + id);
        console.log("oninput: " + "onProdInput('" + id + "')");
        input.setAttribute("oninput", "onProdInput('" + id + "');");
    }
    input.setAttribute("onclick", "highlightRow('" + nc_curRow.toString() + "');");
    
    cont.appendChild(label);
    cont.appendChild(input);

    return cont;
}

function onIntInput(id)
{
    let inputField = document.getElementById(id);
    checkInputValidity(inputField);

    doneCheck("np", nc_curRow);
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
}


function onDropdownSelect()
{
    currentCat = document.getElementById("np-dropdown").value;

    doneCheck("np", nc_curRow);
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
    return fields;
}

function addTooltip(el, text)
{
    let parentEl = el.parentElement;
    
    let spans = parentEl.getElementsByTagName("span");

    if(spans.length == 0)
    {
        let ttt = document.createElement("span");
        ttt.setAttribute("class", "tooltip-text");
        ttt.appendChild(document.createTextNode(text));

        let newClass = parentEl.getAttribute("class") + " tooltip";
        parentEl.setAttribute("class", newClass);
        parentEl.appendChild(ttt);
    } 
}

function removeTooltip(el)
{
    let parentEl = el.parentElement;

    let spans = parentEl.getElementsByTagName("span");

    if(spans.length > 0)
    {
        let oldClass = parentEl.getAttribute("class");
        let oldClassSpl = oldClass.split(" ");
        let newClass = oldClassSpl[0];

        parentEl.setAttribute("class", newClass);
        parentEl.removeChild(spans[0]);
    }
}

function onCheckbox()
{
    let checkbox = document.getElementById("np-checkbox");
    checkboxValue = checkbox.checked;

    let dropdown = document.getElementById("np-dropdown");
    let newcatInput = document.getElementById("np-newcat-input");

    if(checkboxValue)
    {
        dropdown.setAttribute("disabled", "true");
        newcatInput.removeAttribute("disabled");
        currentCat = newcatInput.value;
    }
    else
    {
        dropdown.removeAttribute("disabled");
        newcatInput.setAttribute("disabled", "true");
        currentCat = dropdown.value;
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
    else
    {
        if(document.getElementById(prefix + "-dropdown").value == "")
        {
            returnValue = false;
        }
    }

    for(let i = 0; i <= rowCount; ++i)
    {
        let iterStr = i.toString();
        let prodField = document.getElementById(prefix + "-product-" + iterStr);
        let kcalField = document.getElementById(prefix + "-kcal-" + iterStr);
        let carbField = document.getElementById(prefix + "-carb-" + iterStr);
        let protField = document.getElementById(prefix + "-prot-" + iterStr);
        let fatField = document.getElementById(prefix + "-fat-" + iterStr);


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

        if(kcalField.value == "" || carbField.value == "" || protField.value == "" || fatField.value == "")
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

    // Create new category
    if(checkboxValue)
    {
        jsonData[currentCat] = {};
    }

    for(r of rows)
    {
        let conts = r.getElementsByTagName("div");

        let prodName = "";
        let kcal = 0;
        let carb = 0;
        let prot = 0;
        let fat = 0;

        for(c of conts)
        {
            let cClass = c.getAttribute("class");

            // Handle new prod name
            if(cClass == prefix + "-product-container")
            {
                prodName = c.getElementsByTagName("input")[0].value;
            }
            else if(cClass == prefix + "-kcal-container")
            {
                kcal = parseInt(c.getElementsByTagName("input")[0].value);
            }
            else if(cClass == prefix + "-carb-container")
            {
                carb = parseInt(c.getElementsByTagName("input")[0].value);
            }
            else if(cClass == prefix + "-prot-container")
            {
                prot = parseInt(c.getElementsByTagName("input")[0].value);
            }
            else if(cClass == prefix + "-fat-container")
            {
                fat = parseInt(c.getElementsByTagName("input")[0].value);
            }
        }

        let dict = {
            "cal": kcal,
            "carb": carb,
            "prot": prot,
            "fat": fat
        }
        jsonData[currentCat][prodName] = dict;
    }

    // update main data
    let fs = require("fs");
    let jf = p.join(p.dirname(__dirname), './app/src/extraResources/', 'data.json');
    console.log(jf);
    fs.writeFileSync(jf, JSON.stringify(jsonData));

    ipcRendererNp.send("new-data", jsonData);
}

ipcRendererNp.on("finalize-data", function(event, data) {
    jsonData = data;
    
    let cDropdown = document.getElementById("np-dropdown");
    cDropdown.appendChild(createOption(""));

    for(cat in jsonData)
    {
        cDropdown.appendChild(createOption(cat));
    }
});