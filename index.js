const dropDownContent = document.querySelector(".dropDown-content");
const dropdownselectedvalue = document.getElementById("dropdownselectedvalue");
const dropDown = document.getElementById("dropDown");
const searchText = document.getElementById("searchText");
const searchClick = document.querySelector(".fa-magnifying-glass");
const items = document.querySelector(".items");
const loadMore = document.querySelector(".loadMore");
const totalResults = document.getElementById("totalResults");
const popUpview = document.querySelector(".popUpview");

let page = 1,
  perPage = 15,
  searchItem = "Picture";

// Event listener for dropdown content selection
dropDownContent.addEventListener("click", (e) => {
  dropdownselectedvalue.innerHTML = e.target.innerHTML;
  dropDown.checked = false;
  searchItem = e.target.textContent.trim();
  loadMore.style.display = "none";
  items.innerHTML = "";
  totalResults.innerHTML = 0;
});

// Event listener for page load to display default search results
window.addEventListener("load", () => {
  const defaultSearchTerm = "creation"; // Set your default search term here
  loadMore.style.display = "none";
  generateAPIresponse(defaultSearchTerm, true);
});

// Event listener for search click
searchClick.addEventListener("click", () => {
  generateAPIresponse(searchText.value, true);
});

// Function to generate API response
function generateAPIresponse(searchTerm, isNewSearch) {
  if (isNewSearch) {
    page = 1;
    items.innerHTML = "";
  } else {
    page++;
  }
  const APIkey = "hZoDP2Z3Ojg49A7cFH65UMgBx0QdIQIqIUvpJUnk9tCxwRYndRDkLfLX";

  loadMore.style.display = "block";
  loadMore.innerText = "loading...";

  let APIURL = `https://api.pexels.com/v1/search?query=${searchTerm}&page=${page}&per_page=${perPage}`;
  if (searchItem == "Video") {
    APIURL = `https://api.pexels.com/videos/search?query=${searchTerm}&page=${page}&per_page=${perPage}`;
  }
  fetch(APIURL, { headers: { Authorization: APIkey } })
    .then((response) => response.json())
    .then((results) => {
      totalResults.innerText = results.total_results;

      // Handle no results found
      if (results.total_results === 0 || results.status === 400) {
        items.innerHTML = `
          <div class="notFound">
              <i class="fa-regular fa-face-frown fa-2xl"></i>
              <h1>${searchTerm}</h1>
              <p>SORRY, No matches found</p>
              <br/>
              <h2>Try another search term</h2>
          </div>
        `;
        items.style.columns = "auto";
        loadMore.style.display = "none";
        return;
      }

      items.style.columns = "5 340px";
      if (document.querySelector(".notFound")) {
        document.querySelector(".notFound").remove();
      }

      loadMore.innerText = "Load More";

      // Generate image items if photos are found
      if (results.photos != undefined) {
        results.photos.forEach((photo) => {
          generateImageItems(photo);
        });
      }

      // Generate video items if videos are found
      if (results.videos != undefined) {
        results.videos.forEach((video) => {
          generateVideoItems(video);
        });
      }

      // Hide load more button if no next page
      if (results.next_page == undefined) {
        loadMore.style.display = "none";
      }
    });
}

// Function to generate image items
const generateImageItems = (item) => {
  let div = document.createElement("div");
  div.classList.add("card");

  div.innerHTML = `<img src=${item.src.original} alt=${item.alt} onclick ="showPopupview('image','${item.src.original}','${item.photographer}')" />`;
  div.innerHTML += `
  <div class="details">
         <div class="photographer">
            <i class="fa-solid fa-camera-retro"></i>
            <span>${item.photographer}</span>
        </div>
        <button onclick="downloadFile('image','${item.src.original}')"> <i class="fa-solid fa-download"></i></button>
  </div>`;
  items.append(div);
};

// Function to show popup view for image or video
const showPopupview = (type, element, name) => {
  let image = `<img src="${element}" />`;
  let video = `<video src="${element}" autoplay loop controls></video>`;

  popUpview.querySelector(".previewItem").innerHTML = `<div class="elementItem">
    ${type == "image" ? image : video}
    </div>`;

  document.getElementById("setDownloadAttr").setAttribute("data-type", type);
  document.getElementById("setDownloadAttr").setAttribute("data-file", element);

  popUpview.querySelector(".photographer span").innerText = name;
  popUpview.classList.add("show");
  document.body.style.overflow = "hidden";
};

// Event listener for download click
document.getElementById("downloadClick").addEventListener("click", (e) => {
  downloadFile(
    e.target.getAttribute("data-type"),
    e.target.getAttribute("data-file")
  );
});

// Function to hide popup view
const hidePopupview = () => {
  popUpview.classList.remove("show");
  document.body.style.overflow = "auto";
};

// Function to download file
function downloadFile(type, fileUrl) {
  if (type === "image") {
    fetch(fileUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "download.jpg";
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  } else {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = "download.mp4";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

// Function to generate video items
const generateVideoItems = (item) => {
  let div = document.createElement("div");
  div.classList.add("card");

  let videoEl = document.createElement("video");
  videoEl.src = item.video_files[1].link;
  videoEl.autoplay = false;
  videoEl.loop = true;
  videoEl.controls = false;

  videoEl.addEventListener("mouseenter", () => {
    videoEl.play();
  });

  videoEl.addEventListener("mouseleave", () => {
    videoEl.pause();
  });

  div.addEventListener("click", () => {
    showPopupview("video", item.video_files[1].link, item.user.name);
  });

  div.appendChild(videoEl);
  items.append(div);
};

// Event listener for load more click
loadMore.addEventListener("click", () => {
  generateAPIresponse(searchItem, false);
});
