### BUILD STEP: react packages
FROM node:bookworm AS webpack
RUN mkdir -p  /build
WORKDIR /build
# Copy webpack config
COPY ./js_src/package.json .
COPY ./js_src/package-lock.json .
# Install dependencies
RUN npm install

# Copy files
COPY ./js_src/webpack.config.js .
COPY ./js_src/.babelrc .
COPY ./js_src/tsconfig.json .
RUN mkdir -p ./static/js
COPY ./js_src/src/ ./src/

# Build
ARG PROD_BUILD
RUN PROD_BUILD=${PROD_BUILD} npm run build

### BUILD STEP: python packages
FROM python:3.12-bookworm AS python
RUN apt-get -y update && apt-get install -y curl && curl -sSL https://install.python-poetry.org | python3 -
COPY poetry.lock pyproject.toml ./
RUN /root/.local/bin/poetry export --without-hashes --format=requirements.txt > requirements.txt
RUN python3 -m pip install --user --no-cache-dir -r requirements.txt

### FINAL STEP
FROM python:3.12-slim-bookworm
# Copy python packages
COPY --from=python /root/.local /root/.local

# Copy application
RUN mkdir -p /app
WORKDIR /app
COPY static ./static/
RUN rm -r ./static/js
COPY templates ./templates/
COPY main.py api.py .
# Copy React build files
COPY --from=webpack /static/js/ ./static/js/

# Start
ARG GUNICORN_WORKERS
CMD exec /root/.local/bin/gunicorn --bind 0.0.0.0:80 --reload --timeout=60 --workers=${GUNICORN_WORKERS} --worker-class=${GUNICORN_WORKER_CLASS} main:app
