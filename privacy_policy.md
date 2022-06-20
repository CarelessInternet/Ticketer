## Disclaimer

The information here may not always be up to date. If it isn't up to date, feel free to join the [support server](https://discord.gg/kswKHpJeqC) and say so or open an issue here on GitHub.<br>
Last Updated: 20 June, 2022

## What do you mean by "Discord Data?"

From the official [Discord Developer Privacy Policy](https://discord.com/developers/docs/policies-and-agreements/developer-policy):

> “Discord Data” means any and all data you obtain through the APIs.

# Privacy Policy

## What Discord Data do you store?

As of right now, Ticketer collects one of the following Discord Data requested through a command:

- Ticketing Config Commands:
  - Guild ID
  - Role ID
- Welcome/Goodbye Config Commands:
  - Guild ID
  - Channel ID
- Suggestions Commands:
  - Guild ID
  - Channel ID

### What other optional data is stored/created?

As of right now, Ticketer collects/creates the following data requested through a command:

- Ticketing Config Commands:
  - Channel(s) ID (optional specified support channel, logs channel or support category channel)
  - True/False for whether text channels should be used instead of threads
  - True/False for whether the ticket should ping the ticketing managers in text channels
  - A description of the "notes" for tickets, optional comments that should be displayed in the ticket
  - A customized description for ticket panels
- Welcome/Goodbye Config Commands:
  - Enabled (to enable or disable the welcome/goodye messages)
- Suggestions Commands:
  - Amount of reactions needed to pin a suggestion
  - User IDs for blocking/unblocking users from using the `suggest` command
  - A customized description for suggestion panels

## Why do you need the data?

All of the data collected is required to keep the commands and functionality provided by Ticketer working as expected.

## How do you use the data?

The ticketing data is used to know/do the following:
  - What server the data belongs to
  - The role to invite to each new support ticket
  - Optionally the channel for tickets
  - Optionally the logs channel to send logs to
  - Optionally to ping managers in a text channel
  - Optionally the notes to display under each ticket
  - Optionally the information to display in ticket panels


The welcome/goodbye data is used to know the following:
  - What server and channel to send the greeting/farewell to
  - Optionally whether or not to enable the messages


The suggestions data is used to know the following:
  - What server the data belongs to
  - The channel for suggestions to be sent to
  - Optionally the amount of reactions needed to pin a suggestion
  - Optionally the information to display in suggestion panels

## How long is the data stored for?

All data stored remains permanently, unless asked for deletion or the bot gets kicked/leaves the guild.

## Do you share any data to companies or other people?

No data is shared with anyone or any companies.

## How can users contact you if they have concerns about your bot?

They may join the official support server to discuss such concerns, or open an issue on GitHub.

## How can users have the data removed?

They can either kick the bot from their server, which will automatically delete all data associated with the server, or do the following above.
