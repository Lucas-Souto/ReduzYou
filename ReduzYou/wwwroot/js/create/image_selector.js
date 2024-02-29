const addImages = document.getElementById("add-images"),
    imageUpload = document.getElementById("image-upload");
const imageSelector = document.getElementById("image-selector");
const availableImages = [];

imageUpload.addEventListener("change", () => addImages.requestSubmit());

addImages.addEventListener("submit", (e) =>
{
    e.preventDefault();

    const formData = new FormData(addImages);
    
    request("api/save_image", "post", formData, false, (request) => addMoreImages([request.responseText]));

    addImages.reset();
});

request("api/get_images", "post", {}, false, (request) => addMoreImages(JSON.parse(request.responseText)));

function addMoreImages(images = [])
{
    for (let i = 0; i < images.length; i++)
    {
        availableImages.push(images[i]);
        imageSelector.insertAdjacentHTML('beforeend', `<img class="selector-item" src="${images[i]}" />`);
    }
}