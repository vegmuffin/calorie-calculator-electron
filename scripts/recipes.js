var recipeCategories = [];
var ingCounters = {};

var filterCategories = [];

function populateRecipes()
{
    let rcpContent = document.getElementById("recipe-content");
    for(let i = 0; i < recipeData.length; ++i)
    {
        rcp(rcpContent, recipeData[i]);
        if(!recipeCategories.includes(recipeData[i]["category"]))
        {
            recipeCategories.push(recipeData[i]["category"]);
        }
    }

    for(let i = 0; i < recipeCategories.length; ++i)
    {
        createCategoryCheckbox(recipeCategories[i], true);
        filterCategories.push(recipeCategories[i]);
    }
}

function createCategoryCheckbox(name, checked)
{
    let cbId = name + "-checkbox";
    let cbCont = createContainer("recipe-cb-container");
    let cbLb = createLabel(cbId, name + ": \xa0");
    let cb = document.createElement("input");
    cb.setAttribute("type", "checkbox");
    cb.setAttribute("class", "recipe-checkbox");
    cb.setAttribute("id", cbId);
    cb.setAttribute("oninput", "onFilterCheck();");
    cb.checked = checked;
    cbCont.appendChild(cbLb);
    cbCont.appendChild(cb);

    // get header
    let h = document.getElementById("filter-checkboxes");
    h.append(cbCont);
}

function rcp(rcpContent, recipe)
{
    ingCounters[recipe["name"]] = 0;

    // HEADER
    let rcpCont = createContainer("a-recipe-container");
    rcpCont.setAttribute("id", recipe["name"]);
    let rcpHeaderCont = createContainer("a-recipe-header");
    rcpHeaderCont.setAttribute("id", recipe["name"] + "-header");
    rcpCont.appendChild(rcpHeaderCont);

    let rcpHeaderSpan = document.createElement("span");
    let spanText = "<b>" + recipe["name"] + "</b> (" + recipe["category"] + ")";
    rcpHeaderSpan.setAttribute("id", recipe["name"] + "-headerspan");
    rcpHeaderSpan.innerHTML = spanText;
    rcpHeaderCont.appendChild(rcpHeaderSpan);

    let rcpExpandCont = createContainer("a-recipe-expand-container");
    let rcpExpandBtn = document.createElement("button");
    rcpExpandBtn.setAttribute("class", "a-recipe-expand-button");
    rcpExpandBtn.setAttribute("id", recipe["name"] + "-btn");
    rcpExpandBtn.setAttribute("onclick", "rcpExpand('" + recipe["name"] + "-btn');");
    
    // <img src="../imgs/checkmark_icon.png" class="upd-img">
    let rcpExpandBtnImg = document.createElement("img");
    rcpExpandBtnImg.setAttribute("class", "expand-img");
    rcpExpandBtnImg.setAttribute("src", "../imgs/expand.png");
    rcpExpandBtn.appendChild(rcpExpandBtnImg);
    
    rcpExpandCont.appendChild(rcpExpandBtn);
    rcpHeaderCont.appendChild(rcpExpandCont);
    
    // CONTENT
    let rcpFooter = createContainer("a-recipe-footer footer-nodisplay");
    rcpFooter.setAttribute("id", recipe["name"] + "-footer");
    
    // DESCRIPTION STUFF
    let rcpFooterDesc = document.createElement("div");
    rcpFooterDesc.setAttribute("class", "recipe-desc");
    rcpFooterDesc.setAttribute("id", recipe["name"] + "-recipedesc");
    rcpFooterDesc.appendChild(document.createTextNode(recipe["description"]));
    rcpFooterDesc.setAttribute("contenteditable", "true");
    rcpFooter.appendChild(rcpFooterDesc);
    
    let ebtn = document.createElement("button");
    ebtn.setAttribute("class", "edit-btn editable");
    let eId = recipe["name"] + "-edit-btn";
    ebtn.setAttribute("id", eId);
    ebtn.setAttribute("onclick", "editOnClick('" + recipe["name"] + "', '" + eId + "');");
    
    let im = document.createElement("img");
    im.setAttribute("class", "edit-img");
    im.setAttribute("src", "../imgs/edit.png");
    ebtn.appendChild(im);
    rcpHeaderCont.appendChild(ebtn);
    
    // unsaved changes space
    let rcpHeaderUnsavedSpan = document.createElement("span");
    rcpHeaderUnsavedSpan.setAttribute("id", recipe["name"] + "-unsavedspan");
    rcpHeaderUnsavedSpan.setAttribute("class", "unsaved");
    rcpHeaderCont.appendChild(rcpHeaderUnsavedSpan);

    // DESC LABELS
    let desc = createContainer("description");
    createDescSpan(desc, "cat", "Kategorijos");
    createDescSpan(desc, "prod", "Produktai");
    createDescSpan(desc, "amount", "Kiekis (g)");
    createDescSpan(desc, "carbs", "Anglv.");
    createDescSpan(desc, "fats", "Rieb.");
    createDescSpan(desc, "prot", "Balt.");
    createDescSpan(desc, "cals", "KCAL");
    createDescSpan(desc, "skaid", "Skaid.");
    rcpFooter.appendChild(desc);
    
    // ADDROW BTN
    let rcpAddrowCont = createContainer("add-row-container");
    rcpAddrowCont.setAttribute("id", recipe["name"] + "-addrow");
    let rcpAddrowBtn = document.createElement("button");
    rcpAddrowBtn.setAttribute("class", "add-row");
    rcpAddrowBtn.setAttribute("id", recipe["name"] + "-addrowbtn");
    rcpAddrowBtn.setAttribute("onclick", "addRcpRow('" + recipe["name"] + "');");

    let addIm = document.createElement("img");
    addIm.setAttribute("src", "../imgs/plus_icon.png");
    addIm.setAttribute("class", "addrow-img");

    rcpAddrowBtn.appendChild(addIm);
    rcpAddrowCont.appendChild(rcpAddrowBtn);

	// TOTALS
	let totals = createContainer("totals");
	totals.setAttribute("id", recipe["name"] + "-totals-row");
	totals.appendChild(rcpAddrowCont);
	
    // INGREDIENT ROWS
    let ingrs = recipe["ingredients"];
    for(let i = 0; i < ingrs.length; ++i)
    {
		rcpRow(recipe["name"], ingrs[i], rcpFooter, i, totals);
        if(i == ingrs.length - 1) ingCounters[recipe["name"]] = i;
    }
	

	let emptyBig = createContainer("totals-empty")
	let emptySmall = createContainer("totals-empty-left")
    let tTitle = createContainer("totals-title");
    let spn = document.createElement("span");
    spn.appendChild(document.createTextNode("Viso:"));
    tTitle.appendChild(spn);
	totals.appendChild(emptyBig);
    totals.appendChild(tTitle);
	
    createTotalEl(totals, "totals-carbs-cont", recipe["name"], "carb");
    createTotalEl(totals, "totals-fats-cont", recipe["name"], "fat");
    createTotalEl(totals, "totals-prot-cont", recipe["name"], "prot");
    createTotalEl(totals, "totals-cal-cont", recipe["name"], "cal");
    createTotalEl(totals, "totals-skaid-cont", recipe["name"], "skaid");
    rcpFooter.appendChild(totals);
	
	totals.appendChild(emptySmall);
    
    let markCont = createContainer("deletion-mark-container");
    let markCbId = recipe["name"] + "-cb";
    let markLb = createLabel(markCbId, "Ištrinti receptą? \xa0");
    markLb.setAttribute("class", "deletion-mark-label");
    let markCb = document.createElement("input");
    markCb.setAttribute("type", "checkbox");
    markCb.setAttribute("id", markCbId);
    markCb.setAttribute("class", "deletion-mark-checkbox");
    markCb.setAttribute("oninput", "onDeletionMark('" + recipe["name"] + "');");
    markCont.appendChild(markCb);
    markCont.appendChild(markLb);
    rcpFooter.appendChild(markCont);

    // SAVE BUTTON
    let sBtn = document.createElement("button");
    sBtn.setAttribute("class", "save-btn");
    sBtn.setAttribute("id", recipe["name"] + "-savebutton");
    sBtn.setAttribute("onclick", "saveOnClick('" + recipe["name"] + "');");
    sBtn.setAttribute("disabled", "true");
    sBtn.appendChild(document.createTextNode("Išsaugoti"));

    let sBtnCont = createContainer("save-btn-div");
    sBtnCont.appendChild(sBtn);
    rcpFooter.appendChild(sBtnCont);

    rcpCont.appendChild(rcpFooter);
    alphabeticalInsert(rcpContent, rcpCont, "a-recipe-container");
}

function createTotalEl(parent, contName, recipeName, which)
{
    let cont = createContainer(contName);
    let spn = document.createElement("span");
    spn.appendChild(document.createTextNode("0"));
    let spnId = "totals-" + which + "-" + recipeName;
    spn.setAttribute("id", spnId);
    cont.appendChild(spn);
    parent.appendChild(cont);
}

function createDescSpan(parentDesc, which, tx)
{
    let spn = document.createElement("span");
    let c = "desc-inline desc-" + which;
    let txEl = document.createTextNode(tx);
    spn.setAttribute("class", c);
    spn.appendChild(txEl);
    parentDesc.append(spn);
}

function addRcpRow(recipeName)
{
    let rcpFooter = document.getElementById(recipeName + "-footer");
    ingCounters[recipeName]++;
    let iBefore = document.getElementById(recipeName + "-totals-row");
    rcpRow(recipeName, null, rcpFooter, ingCounters[recipeName], iBefore);
}

function delRcpRow(row, recipeName)
{
	let rowEl = document.getElementById("recipe-" + recipeName + "-" + row);
	document.getElementById(recipeName + "-footer").removeChild(rowEl);
	ingCounters[recipeName]--;
	realignElements(row, recipeName, ingCounters[recipeName]);
	calcRcpTotals(recipeName);
	saveCheck(recipeName);
}

function rcpRow(recipeName, ingredient, rcpFooter, counter, iBefore)
{
	setTimeout(function() {
        let counterStr = recipeName + "-" + counter.toString();
        let r = createContainer("row");
        r.setAttribute("id", "recipe-" + counterStr);

		// NUMERATION
		let numer = createContainer("numeration");
		let textInside = document.createElement("b");
		textInside.setAttribute("class", "numeration-text");
		numer.appendChild(textInside);
		textInside.innerHTML = (counter+1).toString() + ".";
		r.appendChild(numer);

        let cd = createSearchableDropdown(counterStr, "category", recipeName);
        r.appendChild(cd);
        
        let pd = createSearchableDropdown(counterStr, "product", recipeName);
        r.appendChild(pd);

        let amContainer = createContainer("amount-container-parent");
        let input = document.createElement("input");
        let iId = "amount-" + counterStr;
        input.setAttribute("id", iId);
        input.setAttribute("size", "7");
        input.setAttribute("oninput", "amountChange('" + counterStr + "', '" + recipeName + "');");
        input.setAttribute("onclick", "highlightRow('" + iId + "');");
        input.setAttribute("disabled", "true");
		input.setAttribute("class", "amount-input");
        r = treeAdd(r, amContainer, input);

        macroEl(r, "carb", "carb-" + counterStr);
        macroEl(r, "fat", "fat-" + counterStr);
        macroEl(r, "prot", "prot-" + counterStr);
        macroEl(r, "cal", "cal-" + counterStr);
        macroEl(r, "skaid", "skaid-" + counterStr);

        let deleteCont = createContainer("delete-row-container");
        let rowCount = document.getElementById(recipeName + "-footer").getElementsByClassName("row").length;
        if(rowCount != 0)
        {
            let deleteBtn = document.createElement("button");

            let img = document.createElement("img");
            img.setAttribute("src", "../imgs/minus_icon.png");
            img.setAttribute("class", "delrow-img");
            deleteBtn.appendChild(img);

            deleteBtn.setAttribute("class", "delete-row");
            deleteBtn.setAttribute("id", "delete-row-" + counterStr);

            deleteBtn.setAttribute("onclick", "delRcpRow('" + counter.toString() + "', '" + recipeName + "')");
            deleteCont.appendChild(deleteBtn);
        }
        r.appendChild(deleteCont);

        rcpFooter.insertBefore(r, iBefore);

        // DEFAULT VALS (need to wait a bit for above logic to be inserted into the DOM)
        if(ingredient)
        {
            setTimeout(function() {
                let catOptions = document.getElementById("category-options-" + counterStr);
                let catBtns = catOptions.getElementsByTagName("button");
                for(let b of catBtns)
                {
                    let btnId = b.getAttribute("id");
                    if(btnId.includes(ingredient["category"] + "-" + counterStr))
                    {
                        onCatClick(btnId, recipeName);
                        break;
                    }
                }

                let prodOptions = document.getElementById("product-options-" + counterStr);
                let prodBtns = prodOptions.getElementsByTagName("button");
                for(let b of prodBtns)
                {
                    let btnId = b.getAttribute("id");
                    if(btnId.includes(ingredient["product"] + "-" + counterStr))
                    {
                        onProdClick(btnId, recipeName);
                        break;
                    }
                }

                let amount = document.getElementById("amount-" + counterStr);
                amount.value = ingredient["amount"];
                amountChange(counterStr, recipeName);
				saveCheck(recipeName);
            }, 1);
        }
		saveCheck(recipeName);
    }, 1);
}

function rcpExpand(id)
{
    // visuals
    let clickedBtn = document.getElementById(id);
    let cls = clickedBtn.getAttribute("class");
    let newCls = "";
    if(cls.includes("expanded")) newCls = cls.replace(" expanded", "");
    else newCls = cls + " expanded";
    clickedBtn.setAttribute("class", newCls);

    // logic
    // get footer
    let ft = clickedBtn.parentElement.parentElement.parentElement.getElementsByClassName("a-recipe-footer")[0];
    let ftCls = ft.getAttribute("class");
    let newFtCls = "";
    if(ftCls.includes("footer-nodisplay")) newFtCls = ftCls.replace(" footer-nodisplay", "");
    else newFtCls = ftCls + " footer-nodisplay";
    ft.setAttribute("class", newFtCls);
}

function calcRcpTotals(recipeName)
{
    let carbTotal = 0.0;
    let fatTotal = 0.0;
    let protTotal = 0.0;
    let calTotal = 0.0;
    let skaidTotal = 0.0;

    let carbTotalEl = document.getElementById("totals-carb" + "-" + recipeName);
    let fatTotalEl = document.getElementById("totals-fat" + "-" + recipeName);
    let protTotalEl = document.getElementById("totals-prot" + "-" + recipeName);
    let calTotalEl = document.getElementById("totals-cal" + "-" + recipeName);
    let skaidTotalEl = document.getElementById("totals-skaid" + "-" + recipeName);

    let footer = document.getElementById(recipeName + "-footer");
    let rows = footer.getElementsByClassName("row");

    for(let r of rows)
    {
        let macros = r.getElementsByClassName("macros");
        for(let m of macros)
        {
            let mClass = m.getAttribute("class");
            let mText = m.getElementsByTagName("b")[0].innerHTML;
			if (mText == "-") continue;
			if(mClass.includes("carb")) carbTotal += replacedFloat(mText);
            else if(mClass.includes("fat")) fatTotal += replacedFloat(mText);
            else if(mClass.includes("prot")) protTotal += replacedFloat(mText);
            else if(mClass.includes("cal")) calTotal += replacedFloat(mText);
            else if(mClass.includes("skaid")) skaidTotal += replacedFloat(mText);
        }
    }

	displayValue(carbTotalEl, carbTotal);
	displayValue(fatTotalEl, fatTotal);
	displayValue(protTotalEl, protTotal);
	displayValue(calTotalEl, calTotal);
	displayValue(skaidTotalEl, skaidTotal);
}

function onNewRecipe(newRecipe)
{
    ipcRendererCc.send("recipe-file-add", newRecipe);
    recipeData.push(newRecipe);

    let rcpContent = document.getElementById("recipe-content");
    rcp(rcpContent, newRecipe);
    if(!recipeCategories.includes(newRecipe["category"]))
    {
        recipeCategories.push(newRecipe["category"]);
        createCategoryCheckbox(newRecipe["category"], true);
    }
}

function saveCheck(recipeName)
{
    let check = true;

    let deletion = document.getElementById(recipeName + "-cb").checked;
    if(!deletion)
    {
        let originalRecipeRaw = recipeData.filter(obj => {
            return obj["name"] === recipeName;
        });    
        if(originalRecipeRaw.length == 0)
        {
            check = false;
        }
        else
        {
            let origRecipe = originalRecipeRaw[0];

            let headerStringTest = "<b>" + origRecipe["name"] + "</b> (" + origRecipe["category"] + ")";
            let headerString = document.getElementById(recipeName + "-headerspan").innerHTML;
            if(headerStringTest != headerString) check = false;

            let footer = document.getElementById(recipeName + "-footer");
            let rows = footer.getElementsByClassName("row");

            for(let r of rows)
            {
                let catOptions = r.getElementsByClassName("category-container-parent")[0].getElementsByClassName("options")[0];
                let prodOptions = r.getElementsByClassName("product-container-parent")[0].getElementsByClassName("options")[0];
                let catOptionsSelected = catOptions.getElementsByClassName("dropdown-btn selected-btn");
                let prodOptionsSelected = prodOptions.getElementsByClassName("dropdown-btn selected-btn");

				if(catOptionsSelected.length == 0 || prodOptionsSelected.length == 0)
				{
					check = false;
				}
				else
				{
					check = true
				}
            }
        }
    }
    
    if(!check) {
		//unsavedSpan.innerHTML = "<i>Pakeitimai neišsaugoti</i>";
		// THIS MEANS BUTTON IS DISABLED
		enableDisableElement(recipeName + "-savebutton", true);
	} 
    else
    {
		// THIS MEANS BUTTON IS NOT DISABLED
		enableDisableElement(recipeName + "-savebutton", false);
    }
}

function editOnClick(recipeName, btnId)
{
    let btn = document.getElementById(btnId);
    let btnImg = btn.getElementsByTagName("img")[0];

    let spanTextEl = document.getElementById(recipeName + "-headerspan");
    let rcpHeader = document.getElementById(recipeName + "-header");

    let btnClass = btn.getAttribute("class");
    if(btnClass.includes("editable"))
    {
        let oldSpanText = spanTextEl.innerHTML;
        let lastB = oldSpanText.indexOf("</b>");
        let oldRcpName = oldSpanText.substring(3, lastB);

        let leftovers = oldSpanText.substring(lastB + 5, oldSpanText.length);
        let oldRcpCategory = leftovers.substring(1, leftovers.length - 1);

        btn.setAttribute("class", btnClass.split(" ")[0] + " done");

        let mainCont = createContainer("edit-container");

        let rcpNameCont = createContainer("recipe-name-container-edit");
        let rcpNameLb = createLabel(recipeName + "-editname", "Pavadinimas: \xa0");
        let rcpNameInput = document.createElement("input");
        let rcpNameInputId = recipeName + "-editname";
        rcpNameInput.setAttribute("id", rcpNameInputId);
        rcpNameInput.setAttribute("placeholder", "Įveskite pavadinimą...");
        rcpNameInput.setAttribute("size", "25");
        rcpNameInput.setAttribute("oninput", "editDoneCheck('" + recipeName + "');");
        rcpNameInput.setAttribute("class", "editable-recipes");
        rcpNameInput.value = oldRcpName;
        rcpNameCont.appendChild(rcpNameLb);
        rcpNameCont.appendChild(rcpNameInput);
        mainCont.append(rcpNameCont);

        let rcpCategoryCont = createContainer("recipe-category-container-edit");
        let rcpCategoryLb = createLabel(recipeName + "-editcategory", "Kategorija: \xa0");
        let rcpCategoryInput = document.createElement("input");
        let rcpCategoryInputId = recipeName + "-editcategory";
        rcpCategoryInput.setAttribute("id", rcpCategoryInputId);
        rcpCategoryInput.setAttribute("placeholder", "Įveskite kategoriją...");
        rcpCategoryInput.setAttribute("size", "25");
        rcpCategoryInput.setAttribute("oninput", "editDoneCheck('" + recipeName + "');");
        rcpNameInput.setAttribute("class", "editable-recipes");
        rcpCategoryInput.value = oldRcpCategory;
        rcpCategoryCont.appendChild(rcpCategoryLb);
        rcpCategoryCont.appendChild(rcpCategoryInput);
        mainCont.append(rcpCategoryCont);

        spanTextEl.style.display = "none";
        btnImg.setAttribute("src", "../imgs/checkmark_icon.png");
        btnImg.setAttribute("class", "done-img");
        rcpHeader.insertBefore(mainCont, rcpHeader.firstChild);

        editDoneCheck(recipeName);
    }
    else if(btnClass.includes("done"))
    {
        btn.setAttribute("class", btnClass.split(" ")[0] + " editable");
        btnImg.setAttribute("src", "../imgs/edit.png");
        btnImg.setAttribute("class", "edit-img");

        let nameVal = document.getElementById(recipeName + "-editname").value;
        let catVal = document.getElementById(recipeName + "-editcategory").value;
        rcpHeader.removeChild(rcpHeader.getElementsByClassName("edit-container")[0]);

        spanTextEl.innerHTML = "<b>" + nameVal + "</b> (" + catVal + ")";
        spanTextEl.style.display = "";
    }
}

function editDoneCheck(recipeName)
{
    let check = true;

    let nm = document.getElementById(recipeName + "-editname");
    let ct = document.getElementById(recipeName + "-editcategory");

    let filterRaw = recipeData.filter(obj => {
        return obj["name"] === nm.value;
    });

    if(filterRaw.length > 0 && nm.value != recipeName)
    {
        addTooltip(nm, "Receptas jau egzistuoja");
        check = false;
    }
    else
    {
        removeTooltip(nm);
    }

    if(nm.value == "") check = false;

    if(recipeCategories.includes(ct.value)) ct.style.color = "#5EC61B";
    else ct.style.color = "#000000";

    let donebtnId = recipeName + "-edit-btn";
    if(check) enableDisableElement(donebtnId, false)
    else enableDisableElement(donebtnId, true);
}

function onDeletionMark(recipeName)
{
    let cbValue = document.getElementById(recipeName + "-cb").checked;
    let header = document.getElementById(recipeName + "-header");
    let headerClass = header.getAttribute("class");
    if(cbValue) headerClass += " deletion-header";
    else headerClass = headerClass.replace(" deletion-header", "");
    header.setAttribute("class", headerClass);

    saveCheck(recipeName);
}

function alphabeticalInsert(parent, child, comp)
{
    let otherChildren = parent.getElementsByClassName(comp);
    let childId = child.getAttribute("id");
    let iBefore = null;
    for(let o of otherChildren)
    {
        let oId = o.getAttribute("id");
        if(oId.localeCompare(childId) > 0){
            iBefore = o;
            break;
        }
    }
    parent.insertBefore(child, iBefore);
}

function saveOnClick(recipeName)
{
    let deleteCheck = document.getElementById(recipeName + "-cb").checked;
    if(deleteCheck)
    {
        let wholeContainer = document.getElementById(recipeName);
        let rcpContent = document.getElementById("recipe-content");
        rcpContent.removeChild(wholeContainer);
        delete ingCounters[recipeName];

        for(let i = 0; i < recipeData.length; ++i)
        {
            if(recipeData[i]["name"] == recipeName)
            {
                recipeData.splice(i, 1);
                break;
            }
        }
    }
    else
    {
        let hSpanText = document.getElementById(recipeName + "-headerspan").innerHTML;

        // name
        let lastB = hSpanText.indexOf("</b>");
        let newRcpName = hSpanText.substring(3, lastB);

        // category
        let leftovers = hSpanText.substring(lastB + 5, hSpanText.length);
        let newRcpCategory = leftovers.substring(1, leftovers.length - 1);

        // description
        let newRcpDesc = document.getElementById(recipeName + "-recipedesc").innerHTML;

        // ingredients from rcp rows
        let ingredients = [];
        let footer = document.getElementById(recipeName + "-footer");
        let rows = footer.getElementsByClassName("row");
        for(let r of rows)
        {
            let ingr = {};

            // ingredient category
            let catParent = r.getElementsByClassName("category-container-parent")[0];
            let catOptions = catParent.getElementsByClassName("options")[0];
            let catBtns = catOptions.getElementsByClassName("dropdown-btn selected-btn");
            if(catBtns.length > 0) ingr["category"] = catBtns[0].innerHTML;
            else return;

            // ingredient product
            let prodParent = r.getElementsByClassName("product-container-parent")[0];
            let prodOptions = prodParent.getElementsByClassName("options")[0];
            let prodBtns = prodOptions.getElementsByClassName("dropdown-btn selected-btn");
            if(prodBtns.length > 0) ingr["product"] = prodBtns[0].innerHTML;
            else return;

            // ingredient amount
            let amParent = r.getElementsByClassName("amount-container-parent")[0];
            let amValue = fixedFloat(amParent.getElementsByTagName("input")[0].value);
            ingr["amount"] = amValue;

            ingredients.push(ingr);
        }

        // construct recipe object
        let newRcp = {};
        newRcp["name"] = newRcpName;
        newRcp["category"] = newRcpCategory;
        newRcp["ingredients"] = ingredients;
        newRcp["description"] = newRcpDesc;

        // delete old object, push a new updated one
        for(let i = 0; i < recipeData.length; ++i)
        {
            if(recipeData[i]["name"] == recipeName)
            {
                recipeData.splice(i, 1);
                recipeData.push(newRcp);
                break;
            }
        }

        // re-create the recipe
        let wholeContainer = document.getElementById(recipeName);
        let rcpContent = document.getElementById("recipe-content");
        rcpContent.removeChild(wholeContainer);
        rcp(rcpContent, newRcp);
    }

    // re-do category-list
    let newRecipeCategories = [];
    for(let i = 0; i < recipeData.length; ++i)
    {
        if(!newRecipeCategories.includes(recipeData[i]["category"]))
        {
            newRecipeCategories.push(recipeData[i]["category"]);
        }
    }

    // re-do filter checkboxes
    let h = document.getElementById("filter-checkboxes");
    removeAllChildNodes(h);
    recipeCategories = newRecipeCategories;
    for(let i = 0; i < recipeCategories.length; ++i)
    {
        let checked = false;
        if(filterCategories.includes(recipeCategories[i])) checked = true;
        createCategoryCheckbox(recipeCategories[i], checked);
    }

    let rcpf = p.join(p.dirname(__dirname), './src/extraResources', 'recipes.json');
    fs.writeFileSync(rcpf, JSON.stringify(recipeData));

    ipcRendererCc.send("new-recipe-data", recipeData);
}

function onFilterCheck()
{
    let allRecipes = document.getElementsByClassName("a-recipe-container");
    let allRecipesObj = {};
    for(let ar of allRecipes)
    {
        let hSpanText = ar.getElementsByTagName("span")[0].innerHTML;
        let lastB = hSpanText.indexOf("</b>");
        let leftovers = hSpanText.substring(lastB + 5, hSpanText.length);
        let rcpCategory = leftovers.substring(1, leftovers.length - 1);

        if(!(rcpCategory in allRecipesObj)) allRecipesObj[rcpCategory] = [];
        allRecipesObj[rcpCategory].push(ar);
    }

    let checkboxes = document.getElementsByClassName("recipe-checkbox");
    let newFilterCategories = [];
    for(let c of checkboxes) 
    {
        let cId = c.getAttribute("id");
        let cCat = cId.substring(0, cId.lastIndexOf("-"));
        if(c.checked)
        {
            newFilterCategories.push(cCat);
            for(let i = 0; i < allRecipesObj[cCat].length; ++i)
            {
                let rcpEl = allRecipesObj[cCat][i];
                let rcpElCls = rcpEl.getAttribute("class");
                let newRcpElCls = rcpElCls.replace(" recipecont-nondisplay", "");
                rcpEl.setAttribute("class", newRcpElCls);
            }
        }
        else
        {
            for(let i = 0; i < allRecipesObj[cCat].length; ++i)
            {
                let rcpEl = allRecipesObj[cCat][i];
                let rcpElCls = rcpEl.getAttribute("class");
                if(rcpElCls.indexOf(" recipecont-nondisplay") < 0)
                {
                    rcpElCls += " recipecont-nondisplay";
                    rcpEl.setAttribute("class", rcpElCls);
                }
            }
        }
    }
    filterCategories = newFilterCategories;
}

function recipeSync(data)
{
    // cycle through all categories in product data
    for(let c in data)
    {
        // cycle through all category products in product data
        for(let p in data[c])
        {
            // find all recipes
            let recipeEls = document.getElementsByClassName("a-recipe-container");

            // cycle through all recipes to update them
            for(let rcpEl of recipeEls)
            {
                // cycle through all category+product rows in the recipe.. jesus 4 layer loop??
                let rows = rcpEl.getElementsByClassName("row");
                for(let r of rows)
                {
                    // check if the product we are cycling through is selected
                    let pParent = r.getElementsByClassName("product-container-parent")[0];
                    let pOptions = pParent.getElementsByClassName("options")[0];
                    let pOptionBtns = pOptions.getElementsByClassName("dropdown-btn selected-btn");

                    // get the current category as well since if we match against only the product, it 
                    // still could be a different category+product combination. Upside is that if there is 
                    // a selected product there is a 100% chance there is a category selected.
                    let cParent = r.getElementsByClassName("category-container-parent")[0];
                    let cOptions = cParent.getElementsByClassName("options")[0];
                    let cOptionBtns = cOptions.getElementsByClassName("dropdown-btn selected-btn");

                    let rId = r.getAttribute("id");
                    let lastDash = rId.lastIndexOf("-");
                    let rcpName = rcpEl.getAttribute("id");

                    if(cOptionBtns.length > 0)
                    {
                        // check if category exists
                        let cSelected = cOptionBtns[0];
                        if(!(cSelected.innerHTML in data))
                        {
                            let rcpFooter = document.getElementById(rcpName + "-footer");
                            rcpFooter.removeChild(r);

                            let ind = 0;
                            for(let i = 0; i < recipeData.length; ++i)
                            {
                                if(recipeData[i]["name"] == rcpName)
                                {
                                    ind = i;
                                    break;
                                }
                            }

                            for(let i = 0; i < recipeData[ind]["ingredients"].length; ++i)
                                if(recipeData[ind]["ingredients"][i]["category"] == cSelected.innerHTML)
                                    recipeData[ind]["ingredients"].splice(i, 1);
                            
                            saveCheck(rcpName);
                        }
                        else
                        {
                            if(pOptionBtns.length > 0)
                            {
                                let pSelected = pOptionBtns[0];

                                if(!(pSelected.innerHTML in data[cSelected.innerHTML]))
                                {
                                    let rcpFooter = document.getElementById(rcpName + "-footer");
                                    rcpFooter.removeChild(r);

                                    let ind = 0;
                                    for(let i = 0; i < recipeData.length; ++i)
                                    {
                                        if(recipeData[i]["name"] == rcpName)
                                        {
                                            ind = i;
                                            break;
                                        }
                                    }
                            
                                    for(let i = 0; i < recipeData[ind]["ingredients"].length; ++i)
                                        if(recipeData[ind]["ingredients"][i]["product"] == pSelected.innerHTML)
                                            recipeData[ind]["ingredients"].splice(i, 1);

                                    saveCheck(rcpName);
                                }
                                else
                                {
                                    // check if the selected buttons match category/product data
                                    if(pSelected.innerHTML == p && cSelected.innerHTML == c)
                                    {
                                        // since recipe rows also depend on the ingredient data rather than it's own recipe data,
                                        // we can just refresh

                                        // get the row(ish) from different parts
                                        let pseudoRow = rcpName + rId.substring(lastDash, rId.length);

                                        // refresh by calling amount change even if amount didn't change
                                        amountChange(pseudoRow, rcpName);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // write new rcp data
    let rcpf = p.join(p.dirname(__dirname), './src/extraResources', 'recipes.json');
    fs.writeFileSync(rcpf, JSON.stringify(recipeData));

    ipcRendererCc.send("new-recipe-data", recipeData);
}