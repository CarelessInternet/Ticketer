# Ticketer

Welcome to the official GitHub page for the Ticketer bot! You can find all of the source code right here!<br>

## Support
[The Link to the Discord Server](https://discord.gg/kswKHpJeqC)

## Running the Bot

#### Getting the Files
Obviously, you're gonna need the files to run anything. Get them by running `git clone https://github.com/CarelessInternet/Ticketer.git`

#### Creating `.env` File
In order to do anything with the bot, create a file named `.env` and add all necessary environment variables in the list labelled "Environment Variables."
Don't forget to enable the Server Members and Presence Intent for your bot.
#### Installing Dependencies
Run the command `npm i` to install all dependencies

#### Creating MySQL Table
If you haven't, install `mysql` on your system first. Run the command `npm run mysql` to create all necessary tables

#### Deploying Commands
Run the command `npm run deploy` to deploy the commands

#### Running the Bot
Run the command `npm start` to run the bot in a development environment.<br>
Run the command `npm run production` for a production environment (NEVER run this unless you're running the bot for production, and the bot is in [top.gg](https://top.gg))

## Issues

If you can't get the bot to run, join the [support server](https://discord.gg/kswKHpJeqC) and create a support ticket in #support.<br>
For any bug reports, suggestions or general feedback, please submit an issue.

## Environment Variables

* token (the bot's token)
* clientID (the bot's client ID)
* topGGToken (ONLY for production environment, bot must be in top.gg as well)
* dbHost (for database connections)
* dbUser
* dbPassword
* dbDatabase
* dbPort (if not present, the database connection will use the default `3306`)