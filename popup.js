const saveBtn = document.getElementById("saveBtn");
const doubtInput = document.getElementById("doubtInput");
const doubtsList = document.getElementById("doubtsList");

// Load doubts
function loadDoubts() {
  chrome.storage.local.get(["doubts"], (result) => {
    const doubts = result.doubts || [];
    doubtsList.innerHTML = "";

    doubts.forEach((doubt, index) => {
      const div = document.createElement("div");
      div.className = "doubt";

      // Doubt text
      const text = document.createElement("p");
      text.innerText = doubt.text;

      // Timestamp
      const time = document.createElement("small");
      time.innerText = "Time: " + doubt.time + "s";

      // 🎯 Go to Timestamp button
      const jumpBtn = document.createElement("button");
      jumpBtn.innerText = "Go to Timestamp";
      jumpBtn.onclick = () => {
        if (doubt.videoId) {
          const url = `https://www.youtube.com/watch?v=${doubt.videoId}&t=${doubt.time}s`;
          chrome.tabs.create({ url: url });
        } else {
          alert("Video not found");
        }
      };

      // 🗑️ Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.style.backgroundColor = "red";
      deleteBtn.style.color = "white";

      deleteBtn.onclick = () => {
        doubts.splice(index, 1);
        chrome.storage.local.set({ doubts: doubts }, loadDoubts);
      };

      // Append elements
      div.appendChild(text);
      div.appendChild(time);
      div.appendChild(jumpBtn);
      div.appendChild(deleteBtn);

      doubtsList.appendChild(div);
    });
  });
}

// Save doubt
saveBtn.addEventListener("click", () => {
  const text = doubtInput.value;

  if (!text) return;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          const video = document.querySelector("video");
          return video ? video.currentTime : 0;
        },
      },
      (result) => {
        const currentTime = result[0].result;

        chrome.storage.local.get(["doubts"], (res) => {
          const doubts = res.doubts || [];

          const url = tabs[0].url;
          const videoId = new URL(url).searchParams.get("v");

          doubts.push({
            text: text,
            time: Math.floor(currentTime),
            videoId: videoId,
          });

          chrome.storage.local.set({ doubts: doubts }, () => {
            doubtInput.value = "";
            loadDoubts();
          });
        });
      }
    );
  });
});

// Initial load
loadDoubts();