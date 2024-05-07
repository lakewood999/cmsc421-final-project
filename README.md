# CMSC421 Final Project

This project is a web application that allows users to understand the sentiments of the Internet on a given topic,
proxied by content from Reddit. The application uses a few publicly available sentiment analysis packages using
different technologies and models (Flair, HuggingFace transformers, and NLTK VADER) to analyze the sentiment of posts
and comments on Reddit based on a user query. The sentiment results are show per text body and also in summary. Also
provided is a textual and sentiment summary provided by OpenAI's GPT-3.5 API.

## Live Demo

A live demo of our application is available at [cmsc421.stevensu.dev](https://cmsc421.stevensu.dev). Please be kind with
usage as the app is compute-intensive and features based on OpenAI's API have real costs associated with them.

## File Structure

- `js_src/` contains the frontend code for the project, along with the build configuration and assets
- `old_individual` are code files made during the exploration phase of the project by each group member
- `static/js` contains the compiled frontend code. Generally ignore this unless serving the website. Not guaranteed to
  be up-to-date with the latest frontend code since Docker is the recommended deployment method which automatically
builds the latest assets
- `templates/` contains the HTML templates for the project for Flask to render, mainly used to serve the React frontend
- `main.py` is the main entry point for the Flask server which links the frontend and Python API code
- `api.py` contains the Python API code that interfaces with the sentiment analysis packages and Reddit API
- `perf_testing` contains the notebook, data, and plots for the model performance testing component of the project
- `pyproject.toml` and `poetry.lock` are used to manage Python dependencies for the project
- `Dockerfile` and `docker-compose.yml` are used to build and run the project in a Docker container (for development and
deployment)
- Other files are miscellaneous and/or self-explanatory

## Setup

Note: This project was developed on a Unix-based x86-64 system. Windows users may need to adjust some commands accordingly. Users on ARM-based devices may also need to adjust some Python packages (namely using the general `torch` instead of the CPU-specific variant). Docker is the recommended deploy method to prevent most of these issues. 

1. `cd` to `js_src` and run `npm install`. You'll need node installed at the very least
2. `npm run build` to build the project or `npm run watch` to continuously build as you develop
3. `gunicorn --bind :5000 main.app` to run the server. If you don't have `gunicorn` installed, you can run `python3
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
