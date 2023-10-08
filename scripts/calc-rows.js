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
    let sd = createSearchableDropdown(curRowStr, "category");
    mainDiv.appendChild(sd);

    // PRODUCT DROPDOWN
    let pd = createSearchableDropdown(curRowStr, "product");
    mainDiv.appendChild(pd);

    // AMOUNT INPUT
    var amountContainer = createContainer("amount-container-parent");
    var input = document.createElement("input");
    let iId = "amount-" + curRowStr;
    input.setAttribute("id", iId);
    input.setAttribute("size", "7");
    input.setAttribute("disabled", "true");
    input.setAttribute("oninput", "amountChange(" + curRowStr + ")");
    input.setAttribute("onclick", "highlightRow('" + iId + "');");
	input.setAttribute("class", "amount-input");

    mainDiv = treeAdd(mainDiv, amountContainer, input);

    // MACROS & CALS
    macroEl(mainDiv, "carb", "carb-" + curRowStr);
    macroEl(mainDiv, "fat", "fat-" + curRowStr);
    macroEl(mainDiv, "prot", "prot-" + curRowStr);
    macroEl(mainDiv, "cal", "cal-" + curRowStr);
    macroEl(mainDiv, "skaid", "skaid-" + curRowStr);

    // DELETE BUTTON
    var deleteContainer = createContainer("delete-row-container");
    var deleteBtn = document.createElement("button");

    // IMG
    var img = document.createElement("img");
    img.setAttribute("src", "../imgs/minus_icon.png");
    img.setAttribute("class", "delrow-img");
    deleteBtn.appendChild(img);
    
    deleteBtn.setAttribute("class", "delete-row");
    deleteBtn.setAttribute("id", "delete-row-" + curRowStr);
    deleteBtn.setAttribute("onclick", "delRow('" + curRowStr + "')");
    deleteContainer.appendChild(deleteBtn);
    mainDiv.appendChild(deleteContainer);

    // Insert main
    var addRowBtn = document.getElementById("add-row-button");
    document.getElementById("calorycalc").insertBefore(mainDiv, addRowBtn);
}

function macroEl(rowCont, which, id, defText="-")
{
    var mCont = createContainer(which + "-container-parent macros");
    var mText = document.createElement("b");
    mText.setAttribute("id", id);
    mText.appendChild(document.createTextNode(defText));
    rowCont = treeAdd(rowCont, mCont, mText);
}

function treeAdd(mainDiv, childContainer, el)
{
    childContainer.appendChild(el);
    mainDiv.appendChild(childContainer);
    return mainDiv;
}

function createSearchableDropdown(rowNo, name, recipeName)
{
    let mainCont = createContainer(name + "-container-parent");

    let dropCont = createContainer("dropdown-container");
    let i = name + "-container-" + rowNo;
    dropCont.setAttribute("id", i);

    let inp = createSearchableInput(rowNo, name);

    let optionsCont = createContainer("options");
    optionsCont.setAttribute("id", name + "-options-" + rowNo);

    dropCont.appendChild(inp);
    dropCont.appendChild(optionsCont);
    mainCont.appendChild(dropCont);

    if(name == "category")
    {
        populateSearchableCatDropdown(optionsCont, rowNo, recipeName);
    }

    return mainCont;
}

function createSearchableInput(rowNo, name)
{
    let newInput = document.createElement("input");
    let i = name + "-dropdown-" + rowNo;
    newInput.setAttribute("id", i);
    newInput.setAttribute("onfocus", "onDropdownClick('" + i + "');");
    newInput.setAttribute("oninput", "dropdownFilter('" + i + "');");
    newInput.setAttribute("size", "25");
    newInput.setAttribute("onfocusout", "onDropdownFocusOut('" + rowNo + "', '" + name + "');");
    newInput.setAttribute("placeholder", "Ieškoti...");
    newInput.setAttribute("class", "searchable-input");
    if(name == "product")
    {
        newInput.setAttribute("disabled", "true");
    }
    return newInput;
}

function populateSearchableCatDropdown(catDropdown, curRowStr, recipeName)
{
    let counter = 0;
    for(let cat in jsonData)
    {
        insertDropdownButton(catDropdown, cat, curRowStr, counter, "cat", recipeName);
        counter++;
    }
}

function delRow(row, recipeName)
{
    if(!recipeName || recipeName == 'undefined')
    {
        let rowEl = document.getElementById("calory" + row);
        document.getElementById("calorycalc").removeChild(rowEl);
		curRow--;
		realignElements(row, "", curRow);
		calcTotals();
    }
}

// After deleting a row, need to go over all subsequent elements and edit their attributes 
// so that they don't point to non-existing rows.
function realignElements(deletedRow, recipeName, rowCount) {
	if (!recipeName || recipeName == 'undefined') {
		recipeName = "";
	}
	
	deletedRow = Number(deletedRow)
	for (let i = deletedRow + 1; i < rowCount + 2; ++i) {
		let adjustedRow = (i-1).toString();
		let rowId;
		if (recipeName == "") {
			rowId = "calory" + i.toString();
		} else {
			rowId = "recipe-" + recipeName + "-" + i.toString();
		}
		let row = document.getElementById(rowId);
		let allChildren = row.getElementsByTagName("*");
		for (let j = 0; j < allChildren.length; ++j) {
			
			let element = allChildren[j];
			let elementClass = element.getAttribute("class");
			let parentElementClass = element.parentElement.getAttribute("class");
			let splitId = element.id.split("-");

			if (elementClass == "dropdown-container") {
				splitId[splitId.length-1] = adjustedRow;
				element.setAttribute("id", splitId.join("-"));
			} else if (elementClass == "searchable-input" && element.id.includes("category")) {
				splitId[splitId.length-1] = adjustedRow;
				element.setAttribute("id", splitId.join("-"));
				let rcp = recipeName == "" ? "-" : "-" + recipeName + "-"; 
				let rcpNoPrefix = recipeName == "" ? "" : recipeName + "-";
				element.setAttribute("onfocus", "onDropdownClick('category-dropdown" + rcp + adjustedRow + "')");
				element.setAttribute("oninput", "dropdownFilter('category-dropdown" + rcp +  adjustedRow + "')");
				element.setAttribute("onfocusout", "onDropdownFocusOut('" + rcpNoPrefix + adjustedRow + "', 'category')");
			} else if (elementClass == "searchable-input" && element.id.includes("product")) {
				splitId[splitId.length-1] = adjustedRow;
				element.setAttribute("id", splitId.join("-"));
				let rcp = recipeName == "" ? "-" : "-" + recipeName + "-"; 
				let rcpNoPrefix = recipeName == "" ? "" : recipeName + "-";
				element.setAttribute("onfocus", "onDropdownClick('product-dropdown" + rcp + adjustedRow + "')");
				element.setAttribute("oninput", "dropdownFilter('product-dropdown" + rcp +  adjustedRow + "')");
				element.setAttribute("onfocusout", "onDropdownFocusOut('" + rcpNoPrefix + adjustedRow + "', 'product')");
			} else if (elementClass == "options") {
				// for both category and product dropdown element containers
				splitId[splitId.length - 1] = adjustedRow;
				element.setAttribute("id", splitId.join("-"));
			} else if (parentElementClass.includes("parent macros")) {
				// carb fat prot cal skaid
				splitId[splitId.length - 1] = adjustedRow;
				element.setAttribute("id", splitId.join("-"));
			} else if (elementClass == "dropdown-btn") {
				// for both dropdowns
				let splitOnClick = element.getAttribute("onclick").split("-");
				splitOnClick[splitOnClick.length-2] = adjustedRow;
				element.setAttribute("onclick", splitOnClick.join("-"));

				splitId[splitId.length - 2] = adjustedRow;
				element.setAttribute("id", splitId.join("-"));
			} else if (elementClass == "amount-input") {
				splitId[splitId.length - 1] = adjustedRow;
				element.setAttribute("id", splitId.join("-"));

				let amountChange = recipeName == "" ? "amountChange(" + adjustedRow + ")" : "amountChange('" + recipeName + "-" + adjustedRow + "', '" + recipeName + "');";
				let highlightRow = recipeName == "" ? "highlightRow('amount-" + adjustedRow + "');" : "highlightRow('amount-" + recipeName + "-" + adjustedRow +"');";

				element.setAttribute("oninput", amountChange);
				element.setAttribute("onfocus", highlightRow);
			} else if (elementClass == "delete-row") {
				splitId[splitId.length - 1] = adjustedRow;
				element.setAttribute("id", splitId.join("-"));

				let delRow = recipeName == "" ? "delRow('" + adjustedRow + "')" : "delRcpRow('" + adjustedRow + "', '" + recipeName + "')";
				element.setAttribute("onclick", delRow);
			}
		}
		
		if (recipeName == "") {
			row.setAttribute("id", "calory" + adjustedRow);
		} else {
			row.setAttribute("id", "recipe-" + recipeName + "-" + adjustedRow);
		}
	}
}

function amountChange(row, recipeName)
{
    var cal = document.getElementById("cal-" + row);
    var carb = document.getElementById("carb-" + row);
    var prot = document.getElementById("prot-" + row);
    var fat = document.getElementById("fat-" + row);
    var skaid = document.getElementById("skaid-" + row);

    inputField = document.getElementById("amount-" + row);
    if(inputField.value == "")
    {
        cal.innerHTML = "-";
        carb.innerHTML = "-";
        prot.innerHTML = "-";
        fat.innerHTML = "-";
        skaid.innerHTML = "-";
        calcTotals();
        return;
    }

    if(checkInputValidity(inputField))
    {
		var prodData;
		if (!recipeName || recipeName == 'undefined') {
			prodData = getProdData(row, false);
		} else {
			prodData = getProdData(row, true);
		}

        cal.innerHTML = replacedString((prodData["cal"] * parseFloat(inputField.value)) / 100);
        carb.innerHTML = replacedString((prodData["carb"] * parseFloat(inputField.value)) / 100);
        prot.innerHTML = replacedString((prodData["prot"] * parseFloat(inputField.value)) / 100);
        fat.innerHTML = replacedString((prodData["fat"] * parseFloat(inputField.value)) / 100);
        skaid.innerHTML = replacedString((prodData["skaid"] * parseFloat(inputField.value)) / 100);
    }

    if(!recipeName || recipeName == 'undefined') calcTotals();
    else
    {
        calcRcpTotals(recipeName);
        saveCheck(recipeName);
    }
}

function getProdData(row, isRecipe)
{
	var catValue;
    if (isRecipe) 
	{
		catValue = document.getElementById("category-dropdown-" + row).value;
	} else
	{
		catValue = category_rows[row];
	}
    var prodValue = document.getElementById("product-dropdown-" + row).value;
    return jsonData[catValue][prodValue];
}

function getParentContainer(selected)
{
    let parent = selected.parentElement;
    while(!parent.getAttribute("class").includes("parent"))
    {
        parent = parent.parentElement;
    }
    return parent;
}

function highlightRow(id)
{
    let selected = document.getElementById(id);
    let splitId = id.split("-");
    let row = splitId[splitId.length-1];

    let parentCont = getParentContainer(selected);

    if(!parentCont.getAttribute("class").includes("highlighted"))
    {
        let par = parentCont.parentElement;

        highlightElement(par.getElementsByClassName("category-container-parent")[0]);
        highlightElement(par.getElementsByClassName("product-container-parent")[0]);
        highlightElement(par.getElementsByClassName("amount-container-parent")[0]);
        highlightElement(par.getElementsByClassName("cal-container-parent")[0]);
        highlightElement(par.getElementsByClassName("carb-container-parent")[0]);
        highlightElement(par.getElementsByClassName("prot-container-parent")[0]);
        highlightElement(par.getElementsByClassName("fat-container-parent")[0]);
        highlightElement(par.getElementsByClassName("skaid-container-parent")[0]);
    }

    // remove highlight from others if needed
    let rows = document.getElementsByClassName("row");
    for(let r of rows)
    {
        let rId = r.getAttribute("id");
        if(rId.includes(row))
        {
            continue;
        }

        let rDivs = r.getElementsByTagName("div");
        let highlightedRow = false;
        for(let d of rDivs)
        {
            let dClass = d.getAttribute("class");
            if(dClass.includes("container") && dClass.includes("highlighted"))
            {
                let dClassSplit = dClass.split(" ");
                let newClass = "";
                for(let i = 0; i < dClassSplit.length; ++i)
                {
                    if(dClassSplit[i] != "highlighted")
                    {
                        newClass += dClassSplit[i] + " ";
                    }
                }
                newClass.slice(0, -1);
                d.setAttribute("class", newClass);
                highlightedRow = true;
            }
        }
        if(highlightedRow)
        {
            break;
        }
    }
}

function highlightElement(el)
{
    let elClass = el.getAttribute("class");
    let newClass = elClass + " highlighted";
    el.setAttribute("class", newClass);
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
    highlightRow(id);
}

category_rows = {}

function onCatClick(id, recipeName)
{
    let splitId = onCatDropdownButtonClick(id);
    if(splitId)
    {
        let row = splitId[1];
		
        // discard values
        let prodInput = document.getElementById("product-dropdown-" + row);
        prodInput.value = "";
        discardValues(row);
		
        let btn = document.getElementById(id);
        if(btn.parentElement.getAttribute("id"))
		
        if(recipeName == 'undefined')
		{
			let elementName = "category-dropdown-" + row.toString();
			category_rows[row] = document.getElementById(elementName).value
		}
        else
        {
            saveCheck(recipeName);
        }

        populateProductDropdown(splitId, recipeName);
    }
}

function onProdClick(id, recipeName)
{
    let splitId = onProdDropdownButtonClick(id);
    if(splitId)
    {
        let row = splitId[1];
        let cal = document.getElementById("cal-" + row);
        let carb = document.getElementById("carb-" + row);
        let prot = document.getElementById("prot-" + row);
        let fat = document.getElementById("fat-" + row);
        let skaid = document.getElementById("skaid-" + row);
        var amountField = document.getElementById("amount-" + row);
		
		var prodData;
		if (recipeName === undefined || recipeName == "undefined") {
			prodData = getProdData(row, false);
		} else {
			prodData = getProdData(row, true);
		}

        amountField.value = "100";
        amountField.removeAttribute("disabled");

        // Set nutrition values
        cal.innerHTML = replacedString(prodData["cal"]);
        carb.innerHTML = replacedString(prodData["carb"]);
        prot.innerHTML = replacedString(prodData["prot"]);
        fat.innerHTML = replacedString(prodData["fat"]);
        skaid.innerHTML = replacedString(prodData["skaid"]);
        if(recipeName === undefined || recipeName == "undefined")
		{
			calcTotals();
		}
        else
        {
            calcRcpTotals(recipeName);
            saveCheck(recipeName);
        }
    }
}

function calcTotals()
{
    let carbTotal = 0.0;
    let fatTotal = 0.0;
    let protTotal = 0.0;
    let calTotal = 0.0;
    let skaidTotal = 0.0;
    for(let i = 0; i <= curRow; ++i)
    {
        let iStr = i.toString();
        carbTotal += replacedFloat(document.getElementById("carb-" + iStr).innerHTML);
        fatTotal += replacedFloat(document.getElementById("fat-" + iStr).innerHTML);
        protTotal += replacedFloat(document.getElementById("prot-" + iStr).innerHTML);
        calTotal += replacedFloat(document.getElementById("cal-" + iStr).innerHTML);
        skaidTotal += replacedFloat(document.getElementById("skaid-" + iStr).innerHTML);
    }

	displayValue(document.getElementById("totals-carb"), carbTotal);
	displayValue(document.getElementById("totals-fat"), fatTotal);
	displayValue(document.getElementById("totals-prot"), protTotal);
	displayValue(document.getElementById("totals-cal"), calTotal);
	displayValue(document.getElementById("totals-skaid"), skaidTotal);
}

function addRecipe()
{
    ipcRendererCc.send("addrecipe");
}

ipcRendererCc.on("recipe-added", function(event, data) {
    let calcData = [];
    let rows = document.getElementById("calorycalc").getElementsByClassName("row");
    for(let r of rows)
    {
        let prodParent = r.getElementsByClassName("product-container-parent")[0];
        let prodOptions = prodParent.getElementsByClassName("options")[0];
        let selectedBtns = prodOptions.getElementsByClassName("dropdown-btn selected-btn");
        if(selectedBtns.length > 0)
        {
            let product = selectedBtns[0].innerHTML;
            let catParent = r.getElementsByClassName("category-container-parent")[0];
            let category = catParent.getElementsByClassName("options")[0].getElementsByClassName("dropdown-btn selected-btn")[0].innerHTML;
            let amEl = r.getElementsByClassName("amount-container-parent")[0].getElementsByTagName("input")[0];
            let amData = fixedFloat(amEl.value);
            calcData.push({
                "category": category,
                "product": product,
                "amount": amData
            })
        }
    }

    // put everything in one place
    let completeRecipe = {};
    completeRecipe["name"] = data["name"];
    completeRecipe["category"] = data["category"];
    completeRecipe["ingredients"] = calcData;
    completeRecipe["description"] = data["description"];

    onNewRecipe(completeRecipe);
});

ipcRendererCc.on("sync-data", function(event, jData, rData, changed) {
    jsonData = jData;

    // Update everything
    let caloryContent = document.getElementById("calorycalc");
    let dDivs = caloryContent.getElementsByClassName("dropdown-container");

    for(let d of dDivs)
    {
        let dId = d.getAttribute("id");
        let dIdSplit = dId.split("-");
        let row = dIdSplit[dIdSplit.length - 1];
        let name = dIdSplit[0];

        let inputId = name + "-dropdown-" + row;
        let relevantInput = document.getElementById(inputId);

        if(!relevantInput.hasAttribute("disabled"))
        {
            let optionId = name + "-options-" + row;
            let relevantOptions = document.getElementById(optionId);

            let currentlySelected = "";
            let oldBtns = relevantOptions.getElementsByTagName("button");
            for(let ob of oldBtns)
            {
                if(ob.getAttribute("class").includes("selected"))
                {
                    currentlySelected = ob.innerHTML;
                    currentlySelectedId = ob.getAttribute("id");
                    break;
                }
            }
            removeAllChildNodes(relevantOptions);

            if(name == "category")
            {
                if(currentlySelected != "" && !(currentlySelected in jsonData))
                {
                    let prd = document.getElementById("product-dropdown-" + row);
                    if(!prd.hasAttribute("disabled"))
                    {
                        prd.setAttribute("disabled", "true");
                    }
                    currentlySelected = "";
                    relevantInput.value = "";
                    prd.value = "";
                    discardValues(row);
                }
                let counter = 0;
                let id = "";
                for(let c in jsonData)
                {
                    let tempId = insertDropdownButton(relevantOptions, c, row, counter, "cat");
                    if(c == currentlySelected)
                    {
                        id = tempId;
                    }
                    counter++;
                }
                if(currentlySelected != "" && id != "")
                {
                    onCatDropdownButtonClick(id);
                }
            }
            else if(name == "product")
            {
                let cato = document.getElementById("category-options-" + row);
                let selected = cato.getElementsByClassName("dropdown-btn selected-btn");
                if(selected.length > 0)
                {
                    let c = selected[0].innerHTML;
                    if(currentlySelected && !currentlySelected in jsonData[c])
                    {
                        currentlySelected = "";
                        discardValues(row);
                    }
                    let counter = 0;
                    let id = "";
                    for(let p in jsonData[c])
                    {
                        let tempId = insertDropdownButton(relevantOptions, p, row, counter, "prod");
                        if(p == currentlySelected)
                        {
                            id = tempId;
                        }
                        counter++;
                    }
                    if(currentlySelected != "" && id != "")
                    {
                        onProdClick(id);
                    }
                }
                else
                {
                    discardValues(row);
                    if(!relevantInput.hasAttribute("disabled"))
                    {
                        relevantInput.setAttribute("disabled");
                    }
                }
            }
        }
    }

    if(changed)
    {
        recipeData = rData;
        removeAllChildNodes(document.getElementById("recipe-content"));
        removeAllChildNodes(document.getElementById("filter-checkboxes"));
        populateRecipes();
    }
    else
    {
        recipeSync(jData);
    }
});

// used when syncing
function discardValues(row)
{
    document.getElementById("cal-" + row).innerHTML = "-";
    document.getElementById("carb-" + row).innerHTML = "-";
    document.getElementById("prot-" + row).innerHTML = "-";
    document.getElementById("fat-" + row).innerHTML = "-";
    document.getElementById("skaid-" + row).innerHTML = "-";
    let am = document.getElementById("amount-" + row)
    am.value = "";
    am.setAttribute("disabled", "true");
}