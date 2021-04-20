const { now } = require("jquery");

var numbers = "0123456789";
var altLetterMap = {
    "Ą": "A",
    "Č": "C",
    "Ę": "E",
    "Ė": "E",
    "Į": "I",
    "Š": "S",
    "Ų": "U",
    "Ū": "U",
    "Ž": "Z"
}

function filterAltFunc(filter)
{
    filter = filter.toUpperCase();
    for(let i = 0; i < filter.length; ++i)
    {
        let l = filter[i];
        if(l in altLetterMap)
        {
            filter = filter.replace(l, altLetterMap[l]);
        }
    }
    return filter;
}

function filterFunc(filter, txtValue)
{
    if(filter.length <= txtValue.length)
    {
        let trunc = txtValue.slice(0, filter.length);
        trunc = filterAltFunc(trunc);
        if(trunc == filter)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    else
    {
        return false;
    }
}

function checkInputValidity(inputField)
{
    var lastChar = inputField.value.slice(-1);

    var valid = numbers.includes(lastChar.toString());

    let returnValue = true;
    
    if(!valid)
    {
        let r = inputField.value.match(/\./g) || [];
        if(r.length < 2 && lastChar == ".")
        {
            returnValue = true;
        }
        else
        {
            returnValue = false;
        }
    }

    if(!returnValue)
    {
        inputField.value = inputField.value.slice(0, -1);
    }
    return returnValue;
}

function createContainer(className)
{
    var cont = document.createElement("div");
    cont.setAttribute("class", className);
    return cont;
}

function createLabel(forWhat, childText)
{
    var label = document.createElement("label");
    label.setAttribute("for", forWhat);
    label.appendChild(document.createTextNode(childText));
    return label;
}

function isNumeric(str)
{
    return !isNaN(str) && !isNaN(parseFloat(str));    
}

function removeAllChildNodes(parent)
{
    while(parent.firstChild)
    {
        parent.removeChild(parent.firstChild);
    }
}

function enableDisableElement(id, disable)
{
    let el = document.getElementById(id);
    if(disable)
    {
        if(!el.hasAttribute("disabled"))
        {
            el.setAttribute("disabled", "true");
        }
    }
    else
    {
        if(el.hasAttribute("disabled"))
        {
            el.removeAttribute("disabled");
        }
    }
}

function createInput(containerClass, id, initialValue)
{
    var cont = createContainer(containerClass);
    var input = document.createElement("input");

    input.setAttribute("id", id);
    input.value = initialValue;
    if(containerClass.includes("np"))
    {
        if(containerClass != "np-product-container")
        {
            input.setAttribute("size", "7");
            input.setAttribute("oninput", "onIntInput('" + id + "');");
            input.setAttribute("disabled", "true");
        }
        else
        {
            input.setAttribute("oninput", "onProdInput('" + id + "');");
            input.setAttribute("size", "25");
        }
        input.setAttribute("onfocus", "highlightRow('" + nc_curRow.toString() + "');");
    }
    else if(containerClass.includes("up"))
    {
        if(containerClass == "up-prod-container")
        {
            input.setAttribute("oninput", "onProdInput('" + id + "');");
            input.setAttribute("size", "25");
        }
        else
        {
            input.setAttribute("class", "intfield");
            input.setAttribute("size", "7");
            input.setAttribute("oninput", "onIntInput('" + id + "');");
        }
    }
    
    cont.appendChild(input);

    return cont;
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
        let newClass = oldClass.replace(" tooltip", "");

        parentEl.setAttribute("class", newClass);
        parentEl.removeChild(spans[0]);
    }
}

function dropdownFilter(inputId)
{
    let optionsId = inputId.replace("-dropdown-", "-options-");
    let inputField = document.getElementById(inputId);
    let cont = document.getElementById(optionsId);

    let filter = inputField.value.toUpperCase();
    let btns = cont.getElementsByTagName("button");

    filter = filterAltFunc(filter);

    let optHeight = 0;

    for(let btn of btns)
    {
        txtValue = btn.innerHTML;
        if (filterFunc(filter, txtValue))
        {
            btn.style.display = "block";
            optHeight += 22;
        } 
        else
        {
            btn.style.display = "none";
        }
    }
    cont.removeAttribute("style");
    cont.style.height = optHeight;
}

function onDropdownFocusOut(rowNo, which)
{
    // In the time when one elemented is unfocused and until the next one reports to be as focused, there's 
    // a very brief period where nothing is focused -- waiting one milisecond takes care of that.
    setTimeout(function() {
        let focused = document.activeElement;
        if(!focused)
        {
            return;
        }
        if(focused == document.body || !(focused.hasAttribute("class") && focused.getAttribute("class").includes("dropdown-btn")))
        {
            endDropdownDisplay(rowNo, which);
        }
        
    }, 1);
}

function endDropdownDisplay(rowNo, which)
{
    let optId = which + "-options-" + rowNo;
    let inputId = which + "-dropdown-" + rowNo;

    let inputField = document.getElementById(inputId);
    let cls = inputField.getAttribute("class");
    if(cls.includes("selected-input"))
    {
        let splitCls = cls.split(" ");
        inputField.setAttribute("class", splitCls[0]);
    }
    let optionsCont = document.getElementById(optId);
    optionsCont.style.height = 0;
    let btns = optionsCont.getElementsByTagName("button");

    for(let btn of btns)
    {
        btn.style.display = "none";
    }
}

function insertDropdownButton(dropdown, text, rowNo, counter, which, recipeName)
{
    let btn = document.createElement("button");
    btn.setAttribute("class", "dropdown-btn");
    let id = text + "-" + rowNo + "-" + counter.toString();
    if(which == "cat")
    {
        btn.setAttribute("onclick", "onCatClick('" + id + "', " + "'" + recipeName + "');");
    }
    else
    {
        btn.setAttribute("onclick", "onProdClick('" + id + "', " + "'" + recipeName + "');");
    }
    btn.setAttribute("id", id);
    btn.appendChild(document.createTextNode(text));
    btn.setAttribute("tabindex", "-1");

    let btns = dropdown.getElementsByTagName("button");
    if(btns.length > 0)
    {
        let inserted = false;
        for(let b of btns)
        {
            if(btn.innerHTML.localeCompare(b.innerHTML) < 0)
            {
                dropdown.insertBefore(btn, b);
                inserted = true;
                break;
            }
        }
        if(!inserted)
        {
            dropdown.appendChild(btn);
        }
    }
    else
    {
        dropdown.appendChild(btn);
    }

    return id;
}

function onCatDropdownButtonClick(id)
{
    let btn = document.getElementById(id);
    let btnClass = btn.getAttribute("class");
    
    if(btnClass.includes("selected"))
    {
        return;
    }
    else
    {
        let newClass = btnClass + " selected-btn";
        let previouslySelected = btn.parentElement.getElementsByClassName(newClass);
        if(previouslySelected.length > 0)
        {
            previouslySelected[0].setAttribute("class", btnClass);
        }
        btn.setAttribute("class", newClass);

        let splitId = [];
        splitId.push(btn.innerHTML);

        // fukken trimming magic i came up with
        let cat = btn.innerHTML;
        id = id.replace(cat + "-", "");
        let lastDashIndex = id.lastIndexOf("-");
        id = id.substring(0, lastDashIndex);
        
        splitId.push(id);

        endDropdownDisplay(id, "category");

        // Insert the selected dropdown value into the input field
        document.getElementById("category-dropdown-" + id).value = cat;

        return splitId;
    }
}

function populateProductDropdown(splitId, recipeName)
{
    let cat = splitId[0];
    let rowNo = splitId[1];

    let prodOptions = document.getElementById("product-options-" + rowNo);
    removeAllChildNodes(prodOptions);
    enableDisableElement("product-dropdown-" + rowNo, false);
    let counter = 0;

    for(let prod in jsonData[cat])
    {
        insertDropdownButton(prodOptions, prod, rowNo, counter, "prod", recipeName);
        counter++;
    }
}

function onProdDropdownButtonClick(id)
{
    let btn = document.getElementById(id);
    let btnClass = btn.getAttribute("class");
    
    if(btnClass.includes("selected"))
    {
        return;
    }
    else
    {
        let newClass = btnClass + " selected-btn";
        let previouslySelected = btn.parentElement.getElementsByClassName(newClass);
        if(previouslySelected.length > 0)
        {
            previouslySelected[0].setAttribute("class", btnClass);
        }
        btn.setAttribute("class", newClass);

        let splitId = [];
        splitId.push(btn.innerHTML);

        // fukken trimming magic i came up with
        let prod = btn.innerHTML;
        id = id.replace(prod + "-", "");
        let lastDashIndex = id.lastIndexOf("-");
        id = id.substring(0, lastDashIndex);

        splitId.push(id);

        endDropdownDisplay(id, "product");

        // Insert the selected dropdown value into the input field
        document.getElementById("product-dropdown-" + id).value = prod;

        return splitId;
    }
}

function emojiPress()
{
    let em = document.getElementById("em")
    let emCls = em.getAttribute("class");
    if(emCls.includes("displayed"))
    {
        em.setAttribute("class", "emoji-container");
    }
    else
    {
        em.setAttribute("class", "emoji-displayed");
    }
}

function onEmojiSelect(det)
{
    //console.log(det); need -> 'unicode' field

    let em = document.getElementById("em"); // the div
    let ebtn = document.getElementById("ebtn"); // the btn

    // remove the emoji display(
    em.setAttribute("class", "emoji-container");

    // add the unicode instead of the add emoji image
    removeAllChildNodes(ebtn);
    ebtn.appendChild(document.createTextNode(det["unicode"]));
}

function onEmojiFocusOut()
{
    setTimeout(function() {
        let focused = document.activeElement;
        let parent = focused;
        let em = document.getElementById("em");
        let ebtn = document.getElementById("ebtn");
        while(parent != document.body)
        {
            parent = parent.parentElement;
            if(parent.hasAttribute("class") && parent.getAttribute("class").includes("icon-container"))
            {
                ebtn.focus();
                return;
            }
        }
        em.setAttribute("class", "emoji-container");
    }, 20);
}

function fixedFloat(numStr)
{
    let num = 0;
    if(parseFloat(numStr))
    {
        num = parseFloat(parseFloat(numStr).toFixed(2));
    }
    return num;
}