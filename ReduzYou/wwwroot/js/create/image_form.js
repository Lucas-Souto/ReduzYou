const addImages = document.getElementById("add-images"),
    images = document.getElementById("images");
const imageSelector = document.getElementById("image-selector");
const availableImages = [];

images.addEventListener("change", () => addImages.requestSubmit());

addImages.addEventListener("submit", (e) =>
{
    e.preventDefault();

    const formData = new FormData(addImages);
    
    request("api/save_image", "post", formData, false, (request) => addMoreImages(JSON.parse(request.responseText)));

    addImages.reset();
});

request("api/get_images", "post", {}, false, (request) => addMoreImages(JSON.parse(request.responseText)));

function addMoreImages(images = [])
{
    for (let i = 0; i < images.length; i++)
    {
        availableImages.push(images[i]);
        imageSelector.insertAdjacentHTML('beforeend', `<img src="${images[i]}" />`);
    }
}