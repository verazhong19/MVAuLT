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
});