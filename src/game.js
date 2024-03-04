/* eslint-env browser */

// Function to load the game with inputs
/*
function loadGame(madLib) {
  const container = document.querySelector('#game');
  container.innerHTML = ''; // Clear previous content

  madLib.inputs.forEach((inputData) => {
    const inputElement = document.createElement('input');
    inputElement.setAttribute('type', 'text');
    inputElement.setAttribute('id', inputData.id);
    inputElement.setAttribute('placeholder', inputData.question);
    inputElement.classList.add('input');
    container.appendChild(inputElement);
  });
}
*/

// Function to display the madlib description
/*
function displayDescription(description) {
  const descriptionContainer = document.querySelector('#description');
  descriptionContainer.value = description;
}
*/

// Function to load the dropdown with madlib names and set up the event listener
function loadDropdown(madLibs) {
  console.log("Attempt to load data into dropdown");

  const dropdown = document.querySelector("#madlibSelector");
  dropdown.innerHTML = ""; // Clear existing options

  madLibs.forEach((madLib, index) => {
    const option = document.createElement("option");
    option.textContent = madLib.name;
    option.value = index;
    dropdown.appendChild(option);
  });

  // Select the first madlib by default if any are available
  if (madLibs.length > 0) {
    dropdown.dispatchEvent(new Event("change"));
  }
}

// Fetch the Madlibs data from the server when the page loads
window.onload = () => {
  console.log("logged");
  fetch("/madLibs")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the JSON of the response
    })
    .then((data) => {
      // Assuming data contains the MadLibs data under a property (e.g., data.madLibs)
      loadDropdown(data.madLibs); // Load the dropdown with the fetched data
      // Optionally, handle the first MadLib selection here as well
    })
    .catch((error) => {
      console.error("Failed to fetch MadLibs:", error);
    });
};
// Declare a global variable to hold the fetched madLibs data
let madLibsGlobal = [];

// Immediately invoke a fetch operation to load the madLibs data
fetch("/madLibs")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    madLibsGlobal = data.madLibs;
    // Now that data is available, populate the dropdown
    loadDropdown(madLibsGlobal);
  })
  .catch((err) => {
    console.error("Fetch error:", err);
  });

// Function to collect inputs from the user
function collectInputs() {
  const inputs = {};
  document.querySelectorAll(".input").forEach((input) => {
    const { id, value } = input;
    inputs[id] = value;
  });
  return inputs;
}

// Function to display the generated story
function displayStory(story) {
  const storyContainer = document.querySelector("#story");
  storyContainer.innerText = story;
}

// Post user inputs to the server to generate the story
window.generateStory = function () {
  const inputs = collectInputs();
  fetch("/generateStory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs }),
  })
    .then((response) => response.json())
    .then((data) => {
      displayStory(data.story);
    })
    .catch((err) => {
      console.error(err);
    });
};
