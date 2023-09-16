<div align="center">

[![Discord Bots](https://top.gg/api/widget/880454049370083329.svg)](https://top.gg/bot/880454049370083329)

</div><br>

<div align="center">
  <img src="https://shields.io/github/package-json/v/CarelessInternet/Ticketer">
  <img src="https://shields.io/github/license/CarelessInternet/Ticketer">
  <img src="https://shields.io/github/commit-activity/m/CarelessInternet/Ticketer?color=green">
</div>

# Ticketer

Welcome to the official GitHub page for the Ticketer bot! All of the source code is right here!<br>
I advise you to only clone this repository for making pull requests, or making your own private version of the bot.<br>
Consider starring the repository, all stars and forks are appreciated!<br>
Do not make a public clone of the bot.

## Support

Have questions or anything related to the bot? Join the [Discord server](https://discord.gg/kswKHpJeqC).

## Versioning

Ticketer uses its own versioning system, inspired by semantic versioning.
  - Major releases are for language rewrites (e.g javascript -> typescript) or multiple code and client-side breaking changes.
  - Minor releases are for client-side breaking changes (e.g renaming a command) or new client-side commands.
  - Patches are for bug fixes, performance enhances, chores, refactors, etc. Non bug-fixed patches can be released if they are 3+ of them.

## Setup

#### Getting the Files

Obviously, you're gonna need the files to run anything. Get them by running `git clone https://github.com/CarelessInternet/Ticketer.git`.

#### Installing MySQL

You're gonna need MySQL to run this bot, please use [this tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04) or similar to setup MySQL.<br>
You only need the MySQL server, the client is not necessary.

#### Creating `.env` File

In order to do anything with the bot, create a file named `.env` and add all necessary environment variables that can be found in `src/environment.d.ts`.<br>
Don't forget to enable the Server Members, Presence Intent, and Message Content Intent for your bot.<br>
Template:
```env
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
DISCORD_OWNER_ID=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
DB_PORT=
```

#### Installing Dependencies

Run the command `npm i` to install all dependencies. This is only needed once.

#### Building

Run the command `npm run build` to compile the files.

#### Creating MySQL Table

Run the command `npm run mysql` to create all necessary tables. This is only needed once.

#### Deploying Commands

Run the command `npm run deploy` to deploy the commands. This is only needed once if you're not adding new commands.
If you are adding new commands, run this command when you have done so.

#### Running the Bot

Run the command `npm start` to run the bot.

##### Windows

If you are using Windows to run the bot, install the `win-node-env` package through the command `npm install -g win-node-env` before running the command above.

## Issues

If you can't get the bot to run, join the [support server](https://discord.gg/kswKHpJeqC) and create a support ticket.<br>
For any bug reports, suggestions or general feedback, please submit an issue or join the support server.

## Pull Requests

If you updated or created anything that benefits the bot, feel free to submit a pull request to be merged into the main branch.
