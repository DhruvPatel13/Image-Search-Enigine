const imageGallery = document.querySelector(".image-gallery");
const showMoreBtn = document.getElementById("show-more-btn");
const form = document.querySelector(".form");
const generateBtn = form.querySelector(".generate-btn");
const quantity = document.querySelector(".img-quantity");
const input = document.getElementById("input");
const darkBtn = document.getElementById("darkBtn");
const lightBtn = document.getElementById("lightBtn");

let page = 1;
let isImageGenerating = false;
let generatedImagesCount = 0;
let ipValue = "";

const themeHandler = () => {
  document.body.classList.toggle("dark");
  const mainElement = document.querySelector("main");
  mainElement.classList.add("fade-out");
  if (document.body.classList.contains("dark")) {
    darkBtn.style.display = "none";
    lightBtn.style.display = "block";
  } else {
    lightBtn.style.display = "none";
    darkBtn.style.display = "block";
  }
  setTimeout(() => {
    if (document.body.classList.contains("dark")) {
      mainElement.style.backgroundImage = "url(./images/bannerDark.jpg)";
    } else {
      mainElement.style.backgroundImage = "url(./images/bannerLight.png)";
    }
    mainElement.classList.remove("fade-out");
    mainElement.classList.add("fade-in");
    setTimeout(() => {
      mainElement.classList.remove("fade-in");
    }, 2000);
  }, 500);
};
const createImageTemplates = (templateNum) => {
  return Array.from(
    { length: templateNum },
    () =>
      `  <div class="img-card loading">
                <img src="" alt="">
                    <a href="#" class="download-btn" target="_blank">
                        <img src="images/download.png" />
                    </a>
            </div>
        `
  ).join("");
};

function updateImages(results) {
  imageGallery.insertAdjacentHTML(
    "beforeend",
    createImageTemplates(quantity.value)
  );

  results.forEach((result, i) => {
    const imgCard =
      imageGallery.querySelectorAll(".img-card")[i + generatedImagesCount];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");
    imgElement.src = result.urls.small;

    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      imgCard.setAttribute("class", "img-card");

      downloadBtn.addEventListener("click", (event) => {
        event.preventDefault();
        downloadImage(result.urls.full);
      });
    };
  });

  generatedImagesCount += results.length;
  showMoreBtn.style.display = "block";
}
async function downloadImage(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob(); 
    const url = window.URL.createObjectURL(blob); 
    const tempLink = document.createElement("a"); 
    tempLink.href = url;
    tempLink.setAttribute("download", `image-${new Date().getTime()}.jpg`); 
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading the image:", error);
  }
}
async function generateImages(userPrompt, userImgQuantity) {
  try {
    const apiURL = `https://api.unsplash.com/search/photos?page=${page}&query=${userPrompt}&client_id=${ACCESS_KEY}&per_page=${userImgQuantity}`;
    const response = await fetch(apiURL);
    const data = await response.json();
    const results = data.results;

    if (!response.ok) {
      imageGallery.innerHTML = "";
      throw new Error(
        "Unable to load images at the moment. Please Try Agin Later!!"
      );
    }
    updateImages([...results]);
  } catch (error) {
    alert(error.message);
  } finally {
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
}

showMoreBtn.addEventListener("click", () => {
  page++;
  generateImages(ipValue, quantity.value);
});

const handleGenerationProcess = (e) => {
  e.preventDefault();
  imageGallery.innerHTML = "";
  if (isImageGenerating) return;
  generatedImagesCount = 0;
  generateBtn.disabled = "true";
  generateBtn.innerText = "Generating";
  isImageGenerating = true;
  ipValue = input.value;
  generateImages(input.value, quantity.value);
  input.value = "";
};
form.addEventListener("submit", handleGenerationProcess);
