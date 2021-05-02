// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById('user-image'); // reference to canvas HTML object
const ctx = canvas.getContext('2d'); // used to manipulate canvas
const imageInput = document.querySelector("[id='image-input']"); // reference to file input
var dimensions; //used to draw image
const form = document.querySelector("[id='generate-meme']"); //reference to form
const submit = document.querySelector("[type='submit']"); // reference to Generate button
const reset = document.querySelector("[type='reset']"); // reference to Clear button
const readText = document.querySelector("[type='button']"); // reference to Read Text button]
const topText = document.querySelector("[name='textTop']"); // reference to text field for top text
const bottomText = document.querySelector("[name='textBottom']"); //reference to text field for bottom text
const voiceSelect = document.querySelector("[id='voice-selection']"); 
var synth = window.speechSynthesis; // initialization of speech synthesizer
var voices = synth.getVoices();
var toSpeak = new SpeechSynthesisUtterance();
const slider = document.querySelector("[type='range']"); // reference to volume slider
const icon = document.querySelector("div img") // reference to volume icon

//Updates voices array, required for chrome browsers
synth.addEventListener("voiceschanged", () => {
  voices = synth.getVoices();
  populateVoiceList();
})

//Gets list of voices and updates selection list
function populateVoiceList() {

  voiceSelect.disabled = false;
  voiceSelect.remove(0);

  for(var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
      toSpeak.voice = voices[i]
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
}

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
 
  //reset canvas 
  ctx.fillStyle = 'black';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0,0, canvas.width, canvas.height);

  //draw image
  dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height); 
  ctx.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);

  //toggle buttons
  submit.disabled = false;
  reset.disabled = true;
  readText.disabled = true;

});

// Occurs when user uploads a new image
imageInput.addEventListener('input', () => {

  img.src = URL.createObjectURL(document.querySelector("[id='image-input']").files[0]); //file source from input
  img.alt = imageInput.value.split("\\").pop(); //getting filename from path 
});

// Occurs when user clicks Generate button
form.addEventListener( 'submit', () => {

  //prevents refreshing on form submission 
  event.preventDefault();

  // draw text on image
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.font = 'bold 40px serif';
  ctx.fillText( topText.value.toUpperCase(), canvas.width/2, 30);
  ctx.fillText( bottomText.value.toUpperCase(), canvas.width/2, canvas.height - 5);
  ctx.strokeText( topText.value.toUpperCase(), canvas.width/2, 30);
  ctx.strokeText( bottomText.value.toUpperCase(), canvas.width/2, canvas.height - 5);


  //toggle buttons
  submit.disabled = true;
  reset.disabled = false;
  readText.disabled = false;
});

//Occurs when user clicks Clear button
reset.addEventListener('click', () => {

    //reset canvas 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.querySelector("[id='image-input']").value = "";

    //toggle buttons
    submit.disabled = false;
    reset.disabled = true;
    readText.disabled = true;
});

//Occurs when user clicks Read Text button
readText.addEventListener('click', () => {

  toSpeak.text = (topText.value + " " + bottomText.value);

  speechSynthesis.speak(toSpeak);
});

//Occurs when the user changes the volume on the slider
slider.addEventListener('input', () => {

  toSpeak.volume = slider.value/100;

  // level 0 (0)
  if( slider.value == 0) {

    icon.src = "icons/volume-level-0.svg"
    icon.alt = "Volume Level 0"
  }
  // level 1 (1-33)
  else if( slider.value < 34) {

    icon.src = "icons/volume-level-1.svg"
    icon.alt = "Volume Level 1"
  }
  // level 2 (34-66)
  else if( slider.value < 67 ) {

    icon.src = "icons/volume-level-2.svg"
    icon.alt = "Volume Level 2"
  }
  // level 3 (67-100)
  else {

    icon.src = "icons/volume-level-3.svg"
    icon.alt = "Volume Level 3"
  }
});

//occurs when the user changes the selected voice
voiceSelect.addEventListener('change', () => {

  for( let i = 0; i < voices.length ; i++) {

    //gets the name of the language selected by the user.
    let selected = voiceSelect.options[voiceSelect.selectedIndex].dataset.name;

    if(voices[i].name == selected) {

      toSpeak.voice = voices[i];
    }
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
