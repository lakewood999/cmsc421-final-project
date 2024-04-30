## Setup

1. `cd` to `js_src` and run `npm install`. You'll need node installed at the very least
2. `npm run build` to build the project or `npm run watch` to continuously build as you develop
3. `gunicorn --bind :5000 main.app` to run the server

## Docker
1. `docker compose build` to create the `web` image, `docker compose up` with optional flag `-d` (for daemon/background
   mode) to run the server
