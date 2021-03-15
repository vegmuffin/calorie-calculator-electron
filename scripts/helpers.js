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