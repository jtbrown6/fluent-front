# Fluency App

This is a React-based application that combines a text editor with language learning features such as definition lookup, conjugation, and pronunciation.

## Features

- Text editor with Define, Conjugate, and Pronounce options
- Language selection (Spanish, French, Portuguese)
- Assistance for improving language skills
- Dark mode UI with gradient aesthetics

## Getting Started

1. Make sure you have Node.js installed on your system.
2. Navigate to the project directory in your terminal.
3. Install the dependencies by running:

   ```
   npm install
   ```

4. Set up the environment variable for the API base URL:

   Create a `.env` file in the root of the project and add the following line:

   ```
   REACT_APP_API_BASE_URL=http://your-api-base-url
   ```

   Replace `http://your-api-base-url` with the actual URL of your backend API.

5. Start the development server:

   ```
   npm start
   ```

6. Open your browser and visit `http://localhost:3000` to see the application.

## Usage

- Type or paste text in the editor.
- Select a word or phrase and use the Define, Conjugate, or Pronounce buttons to get more information.
- Use the language dropdown to switch between Spanish, French, and Portuguese.
- Click "Get Assistance" to receive suggestions for improving your text.

## Customization

You can customize the appearance by modifying the `App.css` file, and adjust the functionality by editing the components in the `src/components` directory.

## Containerization

To containerize this application:

1. Create a Dockerfile in the project root.
2. Build the Docker image.
3. Run the container, passing the `REACT_APP_API_BASE_URL` as an environment variable.

Example:

```
docker build -t fluencyapp .
docker run -p 3000:3000 -e REACT_APP_API_BASE_URL=http://your-api-base-url fluencyapp
```

Replace `http://your-api-base-url` with the URL of your backend API.

## Backend API

Ensure your backend API has the following endpoints:

- POST /api/define: For definitions
- POST /api/conjugate: For conjugations
- POST /api/assist: For language assistance
- POST /pronounce: For pronunciation

Each endpoint should accept JSON with `text` and `language` fields.
