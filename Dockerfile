FROM alpine:3.9
RUN apk add --no-cache nodejs yarn
ARG registry="https://registry.npmjs.org"
ADD . /app
WORKDIR /app
RUN yarn install \
    --prod \
    --silent \
    --pure-lockfile \
    --cache-folder /dev/shm/yarn_cache \
    --registry $registry
ENTRYPOINT yarn run