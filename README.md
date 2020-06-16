# Nest Starter

## Description

This project is a reimplementation of [node-rest-starter](https://github.com/Asymmetrik/node-rest-starter/) using the [Nest](https://github.com/nestjs/nest) framework.

It is currently a WIP.

## Getting Started

1. Install Node module dependencies via: `npm install`
1. Use the default configuration in `./config/env/default.js` or override with your own configuration that matches the `NODE_ENV` environment variable by copying the `./config/env/development.template.js` file and renaming it to match the value of `$NODE_ENV`
1. Start the application via `npm start`

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
