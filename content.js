document.addEventListener("keydown", async (event) => {
    if (event.key === "s" && event.ctrlKey) { // Ctrl+S to save frame
      event.preventDefault();
      const video = document.querySelector("video");
      if (video && video.paused) {
        const player = document.getElementsByClassName('video-stream')[0];
        // const timestamp = player.currentTime;
        var hours = parseInt(player.currentTime / (60 * 60), 10);
        var minutes = parseInt((player.currentTime / 60) % 60, 10); // Ensure minutes resets at 60
        var seconds = player.currentTime % 60;
        
        var time = hours > 0 
          ? hours + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds.toFixed(0)).padStart(2, "0")
          : minutes + ":" + String(seconds.toFixed(0)).padStart(2, "0");
        
        const timestamp = time;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png");
        chrome.storage.local.set({ [Date.now()]: { image: imageData, timestamp: timestamp, caption: "" } }, () => {
          console.log("Frame saved!");
        });
      }
    }
  });