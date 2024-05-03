## Setup

1. `cd` to `js_src` and run `npm install`. You'll need node installed at the very least
2. `npm run build` to build the project or `npm run watch` to continuously build as you develop
3. `gunicorn --bind :5000 main.app` to run the server. If you don't have gunicorn installed, you can run `python3
   main.py` for a development server

## Docker
1. `docker compose build` to create the `web` image, `docker compose up` with optional flag `-d` (for daemon/background
   mode) to run the server

## Environment Variables

For security purposes, API keys are not included in this repository. Please create a file named `.env` in the root
directory of this project (same level as this README) and add the following lines and associated values:
```
REDDIT_CLIENT_ID='xxx'
REDDIT_CLIENT_SECRET='xxx
REDDIT_USER_AGENT='python:cmsc421:v0.1.0-beta (by /u/<username>)'
REDDIT_USERNAME='xxx'
REDDIT_PASSWORD='xxx'
OPENAI_API_KEY='xxx'
```
