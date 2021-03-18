var numbers = "0123456789";

function checkInputValidity(inputField)
{
    var lastChar = inputField.value.slice(-1);

    var valid = numbers.includes(lastChar.toString());
    
    if(valid)
    {
        return true;
    }
    else
    {
        inputField.value = inputField.value.slice(0, -1);
        return false;
    }
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

function createOption(value)
{
    var opt = document.createElement("option");
    opt.setAttribute("value", value);
    opt.appendChild(document.createTextNode(value));
    return opt;
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

function createInput(containerClass, id, labelText, initialValue)
{
    var cont = createContainer(containerClass);
    var label = createLabel(id, labelText);
    var input = document.createElement("input");

    input.setAttribute("id", id);
    input.value = initialValue;
    if(containerClass.includes("np"))
    {
        if(containerClass != "np-product-container")
        {
            input.setAttribute("size", "5");
            input.setAttribute("oninput", "onIntInput('" + id + "');");
            input.setAttribute("disabled", "true");
        }
        else
        {
            input.setAttribute("oninput", "onProdInput('" + id + "');");
        }
        input.setAttribute("onclick", "highlightRow('" + nc_curRow.toString() + "');");
    }
    else if(containerClass.includes("up"))
    {
        if(containerClass == "up-prod-container")
        {
            input.setAttribute("oninput", "onProdInput('" + id + "');");
        }
        else
        {
            input.setAttribute("class", "intfield");
            input.setAttribute("size", "5");
            input.setAttribute("oninput", "onIntInput('" + id + "');");
        }
    }
    
    cont.appendChild(label);
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
        let oldClassSpl = oldClass.split(" ");
        let newClass = oldClassSpl[0];

        parentEl.setAttribute("class", newClass);
        parentEl.removeChild(spans[0]);
    }
}