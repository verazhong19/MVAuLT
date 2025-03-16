document.addEventListener("DOMContentLoaded", () => {
    const framesContainer = document.getElementById("frames");
    chrome.storage.local.get(null, (items) => {
        for (const key in items) {
            const { image, caption } = items[key];
            const frameDiv = document.createElement("div");
            frameDiv.innerHTML = `
                <img src="${image}" />
                <textarea placeholder="Add a caption...">${caption}</textarea>
                <button data-key="${key}">Save Caption</button>
            `;
            framesContainer.appendChild(frameDiv);
        }
    });
    
    framesContainer.addEventListener("click", (event) => {
        if (event.target.tagName === "BUTTON") {
            const key = event.target.getAttribute("data-key");
            const caption = event.target.previousElementSibling.value;
            chrome.storage.local.get(key, (items) => {
                if (items[key]) {
                    items[key].caption = caption;
                    chrome.storage.local.set({ [key]: items[key] }, () => {
                        console.log("Caption saved!");
                    });
                }
            });
        }
    });

    // referenced this: https://stackoverflow.com/questions/23160600/chrome-extension-local-storage-how-to-export
    document.addEventListener("click", (event) => {
        if (event.target.id == "export") {
            console.log("hi");

            chrome.storage.local.get(null, function(items) { // null implies all items
                // Convert object to a string.
                var itemsNoImgs = items;
                delete itemsNoImgs.image;
                var result = JSON.stringify(items);

                // TODO: remove the images from the text file
            
                // Save as file
                var url = 'data:application/json;base64,' + btoa(result);
                chrome.downloads.download({
                    url: url,
                    filename: 'mvalttext.json'
                });
            });
        }
    });
});