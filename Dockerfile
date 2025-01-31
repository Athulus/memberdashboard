FROM golang:1.15 as backend-build

WORKDIR /membership
COPY . .

RUN go test -v ./...

ARG GIT_COMMIT="test"
RUN go mod vendor
RUN go build -o server -ldflags "-X memberserver/api.GitCommit=$GIT_COMMIT"

# create a file named Dockerfile
FROM node:latest as frontend-build

WORKDIR /app

COPY ui/package.json /app

# get rid of the ts buildinfo file
# we have to do this in the dockerfile because the ui filesystem is mounted
#   i.e. file changes get written back to the repo and the tsbuildinfo file will conflict with itself
RUN if [ -f tsconfig.tsbuildinfo ]; then rm tsconfig.tsbuildinfo 2> /dev/null; fi
RUN npm install


COPY ./ui /app
# compile and bundle typescript
RUN npm run rollup

# copy from build environments
FROM node:latest

WORKDIR /app

COPY --from=frontend-build /app/dist ./ui/dist/
COPY --from=backend-build /membership/server .
COPY --from=backend-build /membership/templates ./templates
COPY docs/swaggerui/ ./docs/swaggerui/

ENTRYPOINT [ "./server" ]
