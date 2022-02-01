## Disclaimer

The information here may not always be up to date. If it isn't up to date, feel free to join the [support server](https://discord.gg/kswKHpJeqC) and say so or open an issue here on GitHub.<br>
Last Updated: 01 February, 2022

## What do you mean by "Discord Data?"

From the official [Discord Developer Privacy Policy](https://discord.com/developers/docs/policy):

> “Discord Data” means any and all data you obtain through the APIs.

# Privacy Policy

## What Discord Data do you store?

As of right now, Ticketer collects the following Discord Data on success, requested through a command, and if it isn't already stored:

- Ticketing Config Commands:
  - Guild ID
  - Role ID
- Welcome/Goodbye Config Commands:
  - Guild ID
  - Channel ID
- Suggestions Commands:
  - Guild ID
  - Channel ID

## What other optional data is stored/created?

As of right now, Ticketer collects/creates the following data on success and requested through a command:

- Ticketing Config Commands:
  - Channel(s) ID (optional specified support channel, logs channel or support category channel)
  - True/False for whether or not the reply should be shown or hidden (Reply Embeds)
  - True/False for whether or not text channels should be used instead of threads
- Welcome/Goodbye Config Commands:
  - Enabled (to enable or disable the welcome/goodye messages)
- Suggestions Commands:
  - True/False for whether or not the reply should be shown or hidden (Reply Embeds)
  - Amount of reactions needed to pin a suggestion
  - User IDs for blocking/unblocking users from using the `suggest` command

## Why do you need the data?

All of the data collected is required to keep the ticketing, welcome, and suggestions commands functioning as expected.

## How do you use the data?

The ticketing data is used to know what server the data belongs to, the role to invite to each new support ticket, optionally the channel for tickets, optionally the logs channel to send logs to, and optionally whether to send a reply embed or ephemeral reply on successfully creating a ticket.<br>
The welcome/goodbye messages is used to greet or say goodbye to an incoming or leaving user. The data is used to know which server and channel to send it to, and optionally whether or not to enable the messages.<br>
The suggestions data is used to know what server the data belongs to, the channel for suggestions to be sent to, optionally the amount of reactions needed to pin a suggestion, optionally whether to send a reply embed or ephemeral reply on successfully creating a suggestion, and optionally preventing users from using the suggestions commands if they are blocked.

## How long is the data stored for?

All data collected remains permanently, unless asked for deletion or the bot gets kicked/leaves the guild.

## Do you share any data to companies or other people?

No data is shared with anyone or any companies.

## How can users contact you if they have concerns about your bot?

They may join the official support server, or open an issue on GitHub.

## How can users have the data removed?

They can either kick the bot from their server, which will automatically delete all data associated with the server, or do the following above.
