document.addEventListener("DOMContentLoaded", () => {
    const framesContainer = document.getElementById("frames");
    chrome.storage.local.get(null, (items) => {
        for (const key in items) {
            const { image, timestamp, caption } = items[key];
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

    // Export JSON
    document.getElementById("export").addEventListener("click", () => {
        chrome.storage.local.get(null, function (items) {
            const jsonStr = JSON.stringify(items);
            const url = 'data:application/json;base64,' + btoa(jsonStr);
            chrome.downloads.download({
                url: url,
                filename: 'frames.json'
            });
        });
    });

    // Export Image with Wrapped Captions
    const exportImageBtn = document.createElement("button");
    exportImageBtn.innerText = "Export Image";
    exportImageBtn.id = "exportImage";
    document.body.appendChild(exportImageBtn);

    exportImageBtn.addEventListener("click", () => {
        chrome.storage.local.get(null, function (items) {
            const frames = Object.values(items);
            if (frames.length === 0) return alert("No images to export!");

            const cols = 2;
            const rows = Math.ceil(frames.length / cols);
            const imgWidth = 640;
            const imgHeight = 360;
            const captionHeight = 80; // Increased for multi-line captions
            const canvas = document.createElement("canvas");
            canvas.width = imgWidth * cols;
            canvas.height = (imgHeight + captionHeight) * rows;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = "20px Arial";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";

            let x = 0, y = 0;
            let loadedCount = 0;

            frames.forEach(({ image, timestamp, caption }, index) => {
                const img = new Image();
                img.src = image;
                img.onload = () => {
                    ctx.drawImage(img, x, y, imgWidth, imgHeight);

                    // Wrap caption text
                    const captionText = `${timestamp} - ${caption}`;
                    const wrappedText = wrapText(ctx, captionText, x + imgWidth / 2, y + imgHeight + 20, imgWidth - 20, 24);

                    wrappedText.forEach((line, i) => {
                        ctx.fillText(line, x + imgWidth / 2, y + imgHeight + 30 + i * 24);
                    });

                    x += imgWidth;
                    if ((index + 1) % cols === 0) {
                        x = 0;
                        y += imgHeight + captionHeight;
                    }
                    loadedCount++;

                    if (loadedCount === frames.length) {
                        // After all images and captions are drawn, trigger download
                        const link = document.createElement("a");
                        link.download = "stitched_image.png";
                        link.href = canvas.toDataURL("image/png");
                        link.click();
                    }
                };
            });
        });
    });

    // Function to wrap text inside the given width
    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(" ");
        let line = "";
        let lines = [];

        words.forEach(word => {
            let testLine = line + word + " ";
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;

            if (testWidth > maxWidth && line !== "") {
                lines.push(line);
                line = word + " ";
            } else {
                line = testLine;
            }
        });

        lines.push(line);
        return lines;
    }
});