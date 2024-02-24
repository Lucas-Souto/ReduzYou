const materials = ["Pet", "Papelão", "Papel", "Tecido", "Isopor", "Vidro", "Eletrônicos", "Metal"];
const order = document.getElementById("order");
const materialsCheckList = document.getElementById("materials"), allCheck = document.getElementById("all-materials");

function getOrder()
{
    const selected = order.querySelector(".filter-item input[type='radio']:checked");

    return selected.value;
}

function getMaterials()
{
    const result = [];

    for (let i = 0; i < materials.length; i++)
    {
        if (allCheck.checked) result[i] = true;
        else result[i] = document.getElementById(`material${i}`).checked;
    }

    return result;
}

for (let i = 0; i < materials.length; i++)
{
    const id = `material${i}`;

    materialsCheckList.insertAdjacentHTML('beforeend', `
        <div class="filter-item">
            <input id="${id}" type="checkbox" />
            <label for="${id}">${materials[i]}</label>
        </div>
    `);
}

allCheck.checked = true;

function checkAll()
{
    for (let i = 0; i < materials.length; i++)
    {
        const material = document.getElementById(`material${i}`);

        if (allCheck.checked) material.setAttribute("disabled", true);
        else material.removeAttribute("disabled");
    }
}

allCheck.addEventListener("click", checkAll);
checkAll();