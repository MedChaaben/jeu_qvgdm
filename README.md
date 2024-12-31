# Quiz App Project README

## Overview

This Quiz App is a dynamic web application using Node.js, Express.js, and additional technologies for fetching and displaying quiz questions.

## Usage

**Clone the repository**: `git clone [repository-url]`

**You can skip steps 1 and 2 if you prefer to run the application without the backend API and directly use the quiz from XML stored files.**

1. **Install dependencies**: Run `npm install` on backend folder to install required modules.
2. **Starting the server**: Execute `node server.js` from the backend folder to start the server on port 3000.
3. **Starting the live server**: Execute `npx live-server` from the root folder containing `index.html`.


## Features

- **Quiz Questions**: Fetches quiz questions from an external API.
- **Dynamic XML Conversion**: Converts quiz data to XML format for easy handling.

## Technologies

- **Node.js & Express.js**: For server setup and API handling.
- **Axios**: For HTTP requests.
- **xml2js**: For XML building and parsing.

## Routes

- `/fetch-questions`: Route to fetch quiz questions.

## Contributing

Contributions are welcome. Please follow the standard git workflow for submitting changes.

## License

This project is licensed under [specify license].
