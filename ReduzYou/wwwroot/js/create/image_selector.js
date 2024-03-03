const addImages = document.getElementById("add-images"),
    imageUpload = document.getElementById("image-upload");
const imageSelector = document.getElementById("image-selector");
const availableImages = [];
let selectCallback = (link) => { };

imageUpload.addEventListener("change", () => addImages.requestSubmit());

addImages.addEventListener("submit", (e) =>
{
    e.preventDefault();

    const formData = new FormData(addImages);
    
    request("api/save_image", "post", formData, false, (request) =>
    {
        addMoreImages([request.responseText]);
        selectCallback(request.responseText);
    });

    addImages.reset();
    imageSelector.classList.remove("show");
});

request("/api/get_images", "post", {}, false, (request) => addMoreImages(JSON.parse(request.responseText)));

function onSelect(element)
{
    selectCallback(element.getAttribute("src"));
    imageSelector.classList.remove("show");
}

function exitSelect()
{
    imageSelector.classList.remove("show");
}

function openSelector(callback = selectCallback)
{
    selectCallback = callback;
    
    imageSelector.classList.add("show");
}

function addMoreImages(images = [])
{
    for (let i = 0; i < images.length; i++)
    {
        availableImages.push(images[i]);
        imageSelector.insertAdjacentHTML('beforeend', `<img class="selector-item" src="${images[i]}" onclick="onSelect(this)" />`);
    }
}