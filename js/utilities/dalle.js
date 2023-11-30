const generateForm = document.querySelector(".images-generator__form");
const imageGallery = document.querySelector(".image-gallery");

const DALLE_API_KEY_PART1 = "sk-8fGYRpkToK6pX7D";
const DALLE_API_KEY_PART2 = "GeQvFT3BlbkF";
const DALLE_API_KEY_PART3 = "JYvieoEWov7IhCRvSvsab";
const OPENAI_API_KEY = DALLE_API_KEY_PART1 + DALLE_API_KEY_PART2 + DALLE_API_KEY_PART3;
let isImageGenerating = false;

const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".card")[index];
    const imgElement = imgCard.querySelector(".card__img");
    const downloadBtn = imgCard.querySelector(".card__download-btn");

    // Set the image source to the AI-generated image data
    const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = aiGeneratedImage;

    // When the image is loaded, remove the loading class and set download attributes
    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      downloadBtn.setAttribute("href", aiGeneratedImage);
      downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
    };
  });
};

// Send a request to the OpenAI API to generate images based on user inputs
const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: userPrompt,
          n: parseInt(userImgQuantity),
          size: "512x512",
          response_format: "b64_json",
        }),
      },
    );

    if (!response.ok)
      throw new Error("Failed to generate images! Please try again");

    const { data } = await response.json(); // Get data from the response
    updateImageCard([...data]);
  } catch (error) {
    alert(error.message);
  } finally {
    isImageGenerating = false;
  }
};

const handleFormSubmission = (e) => {
  e.preventDefault();
  if (isImageGenerating) return;
  isImageGenerating = true;

  // Get user input and image quantity values from the form
  const userPrompt = e.srcElement[0].value;
  console.log(userPrompt);
  const userImgQuantity = e.srcElement[1].value;

  // Creating HTML markup for image cards with loading state
  const imgCardMarkup = Array.from(
    { length: userImgQuantity },
    () =>
      `<div class="image-gallery__card card loading">
      <img src="assets/img/dalle/loader.svg" alt="AI generated image" class="card__img">
      <a href="#" class="card__download-btn">
        <img src="assets/img/dalle/download.svg" alt="download icon" class="card__download-btn-icon">
      </a>
    </div>`,
  ).join("");

  imageGallery.innerHTML = imgCardMarkup;
  generateAiImages(userPrompt, userImgQuantity);
};

generateForm.addEventListener("submit", handleFormSubmission);

export default { generateForm, handleFormSubmission };