const http = require('http');
const fs = require('fs');
const url = require('url');
const query = require('querystring');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const clientHtml = fs.readFileSync(`${__dirname}/../client/client.html`);
const clientCss = fs.readFileSync(`${__dirname}/../client/style.css`);
const madLibsData = JSON.parse(fs.readFileSync(`${__dirname}/../json/madLibs.json`));

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
  const { template, words } = body;
  let story = template;
  Object.keys(words).forEach((key) => {
    const regex = new RegExp(`{${key}}`, 'g');
    story = story.replace(regex, words[key]);
  });

  respondJSON(request, response, 200, { story });
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
      }
      break;
    case 'POST':
      if (parsedUrl.pathname === '/generateStory') {
        let body = [];

        request.on('data', (chunk) => {
          body.push(chunk);
        });

        request.on('end', () => {
          body = Buffer.concat(body).toString();
          const params = query.parse(body);
          generateStory(request, response, params);
        });
      }
      break;
    default:
      respondJSONMeta(request, response, 404);
      break;
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
