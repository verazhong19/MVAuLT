document.addEventListener("keydown", async (event) => {
    if (event.key === "s" && event.ctrlKey) { // Ctrl+S to save frame
      event.preventDefault();
      const video = document.querySelector("video");
      if (video && video.paused) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png");
        chrome.storage.local.set({ [Date.now()]: { image: imageData, caption: "" } }, () => {
          console.log("Frame saved!");
        });
      }
    }
  });