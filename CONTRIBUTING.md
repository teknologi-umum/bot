# Contributing Guide

Hello! We'd love to see your contribution on this repository soon, even if it's just a typo fix!

Contributing means anything from reporting bugs, ideas, suggestion, code fix, even new feature.

## Bug report, ideas, and suggestion

The [issues](https://github.com/teknologi-umum/bot/issues) page is a great way to communicate to us. Other than that, we have a [Telegram group](https://t.me/teknologi_umum) that you can discuss your ideas into. If you're not an Indonesian speaker, it's 100% fine to talk in English there.

Please make sure that the issue you're creating is in as much detail as possible. Poor communication might lead to a big mistake, we're trying to avoid that.

## Pull request

**A big heads up before you're writing a breaking change code or a new feature: Please open up an [issue](https://github.com/teknologi-umum/bot/issues) regarding what you're working on, or just talk in the [Telegram group](https://t.me/teknologi_umum).**

### Prerequisites

You will need a few things to get things working:

1. Node.js current version (as of now, we're using v16.6.1 as defined in the `.nvmrc` file). You can install it through the [official Node.js download page](https://nodejs.org/en/download/), but we recommend using [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm). Here's a simple installation/setup guide, but you should really refer directly to the repository's README.

```sh
# If you want to install fnm
$ curl -fsSL https://fnm.vercel.app/install | bash

# Then simply use this command
$ fnm use

# OR if you want to install nvm
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

$ nvm use
```

2. [Docker](https://docker.com/) and [Docker Compose](https://docs.docker.com/compose/install/) if you don't have Redis and MongoDB installed on your machine.

3. Telegram Bot Token. You must create one in order to take the bot into development. Telegram has [a guide about it](https://core.telegram.org/bots#6-botfather).

### Getting Started

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own Github account and [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.
2. Run `npm install` to install the dependencies needed.
3. Get the database up and running. You can use `docker-compose up` for this.
4. Rename `.env.example` to `.env` and fill the config key=value needed. The one's necessary is `BOT_TOKEN`, `MONGO_URL` and `REDIS_URL`, you may leave everything else blank. If you're using the Docker Compose file to spin up the database, your `.env` should be:

```ini
NODE_ENV=development
BOT_TOKEN=<your own token>
REDIS_URL=redis://@localhost:6379/
MONGO_URL=mongodb://root:password@localhost:27017/teknologiumum?useNewUrlParser=true&useUnifiedTopology=true&authSource=admin
SENTRY_DSN=
```

5. Run `npm run dev` to start runnint your bot.
6. Happy coding!

### Testing your change

It's really up to you to have an unit test or not. But if you do, just create one on the `tests` directory, and run the test with:

```
npm run test
```

### Directory structure

```
.
├── CONTRIBUTING.md         - You are here
├── docker-compose.yml      - Docker compose file
├── Dockerfile              - Single docker file to run this app
├── fly.toml                - Fly.io configuration
├── LICENSE
├── package-lock.json       - Package lock file
├── package.json            - Meta information & dependencies
├── prepare.cjs             - Simple script to run husky install in a cross-environment
├── README.md
├── src
│  ├── app.js               - App/bot entry point
│  ├── services             - Commands logic
│  └── utlis                - Utilities
└── tests                   - Unit testing with uvu
```

### Before creating a PR

Please run ESLint and Prettier with these commands so you're good on the CI process.

```sh
$ npm run lint
$ npm run format
```

And you're set!
