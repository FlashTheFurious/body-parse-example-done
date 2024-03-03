const fs = require('fs');
const path = require('path');

// Path to the MadLibs JSON data file
const madLibsPath = path.join(__dirname, '../json/madLibs.json');

// Preload MadLibs data into memory for efficiency
let madLibsData;
try {
  const madLibsRaw = fs.readFileSync(madLibsPath);
  madLibsData = JSON.parse(madLibsRaw);
} catch (error) {
  console.error('Failed to load MadLibs data:', error);
  madLibsData = { madLibs: [] }; // Fallback to empty data
}

// Function to respond with a JSON object
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// Function to respond without JSON body, just status code
/*
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};
*/

// Function to return MadLibs data as JSON
const getMadLibs = (request, response) => {
  respondJSON(request, response, 200, madLibsData);
};

// Exporting the getMadLibs function for use in the server
module.exports = {
  getMadLibs,
};
