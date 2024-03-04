const http = require('http');
const fs = require('fs');
const url = require('url');
// const query = require('querystring');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const clientHtml = fs.readFileSync(`${__dirname}/../client/client.html`);
const communityHtml = fs.readFileSync(`${__dirname}/../client/community.html`);
const clientCss = fs.readFileSync(`${__dirname}/../client/style.css`);
const madLibsData = JSON.parse(
  fs.readFileSync(`${__dirname}/../json/madLibs.json`),
);
const publishedStoryFilePath = `${__dirname}/../json/publishedStory.json`;
const publishedStoryData = JSON.parse(
  fs.readFileSync(`${__dirname}/../json/publishedStory.json`),
);

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(clientHtml);
  response.end();
};

const getCss = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(clientCss);
  response.end();
};

const getMadLibs = (request, response) => {
  respondJSON(request, response, 200, madLibsData);
};

const generateStory = (request, response, body) => {
  // Assuming the body parsing logic is correct and we directly get `template` and `words`
  const { text, inputs } = body;
  let story = text;
  Object.keys(inputs).forEach((key) => {
    const regex = new RegExp(`{${key}}`, 'g');
    story = story.replace(regex, inputs[key]);
  });

  response.writeHead(200, { 'Content-Type': 'application/json' });

  // Prepare the JSON data
  const responseData = JSON.stringify({ story });

  // Send the JSON data as the response body
  response.end(responseData);

  // respondJSON(request, response, 200, { story });
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url, true);

  switch (request.method) {
    case 'GET':
      if (parsedUrl.pathname === '/') {
        getIndex(request, response);
      } else if (parsedUrl.pathname === '/style.css') {
        getCss(request, response);
      } else if (parsedUrl.pathname === '/madLibs') {
        getMadLibs(request, response);
      } else if (parsedUrl.pathname === '/community') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(communityHtml);
        response.end();
      } else if (parsedUrl.pathname === '/publishedStory') {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.write(JSON.stringify(publishedStoryData));
        response.end();
      }
      response.end();
      break;
    case 'POST':
      if (parsedUrl.pathname === '/generateStory') {
        // let body = [];
        let data = null;

        request.on('data', (chunk) => {
          // console.log(chunk?.toString());
          data = JSON.parse(chunk);
          // body.push(chunk?.toString());
        });

        request.on('end', () => {
          // body = Buffer.concat(body).toString();
          // const params = query.parse(body);
          generateStory(request, response, data);
        });
      } else if (parsedUrl.pathname === '/publishStory') {
        let requestBody = '';

        request.on('data', (chunk) => {
          // console.log(chunk?.toString());
          // console.log({ chunk: chunk.toString() });
          // requestBody = JSON?.parse(chunk?.toString());
          requestBody += chunk.toString();
          // body.push(chunk?.toString());
        });

        request.on('end', () => {
          try {
            // Parse the JSON content into a JavaScript object
            const jsonString = fs.readFileSync(publishedStoryFilePath, 'utf8');
            const stringArray = JSON.parse(jsonString);
            // Add the new object to the array
            const newString = JSON.parse(requestBody);
            // console.log(stringArray, newString);
            stringArray.publishedStory.push(newString);

            // Convert the JavaScript object back to JSON format
            const updatedJson = JSON.stringify(stringArray, null, 2);

            // Write the updated JSON content back to the file
            fs.writeFileSync(publishedStoryFilePath, updatedJson, 'utf8');

            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end('Object added successfully!');
          } catch (error) {
            // console.error('Error:', error);
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end(error);
          }
        });
      }
      break;
    default:
      respondJSONMeta(request, response, 404);
      break;
  }
};

http.createServer(onRequest).listen(port, () => {
  // console.log(`Server is listening on port ${port}`);
});
