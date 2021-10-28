## Disclaimer

The information here may not always be up to date. If it isn't up to date, feel free to join the [support server](https://discord.gg/kswKHpJeqC) and say so or open an issue here on GitHub.<br>
Last Updated: 22 October, 2021

## What do you mean by "Discord Data?"

From the official [Discord Developer Privacy Policy](https://discord.com/developers/docs/policy):

> “Discord Data” means any and all data you obtain through the APIs.

# Privacy Policy

## What Discord Data do you collect?

As of right now, Ticketer collects the following Discord Data on success, requested through a command, and if it isn't already stored:

- Ticketing Config Commands:
  - Guild ID
  - Role ID
- Welcome/Goodbye Config Commands:
  - Guild ID
  - Channel ID
  - Enabled (True/False)

## What other data is collected/created?

As of right now, Ticketer collects/creates the following data on success and requested through a command:

- Ticketing Config Commands:
  - Channel(s) ID (optional specified support channel and logs channel)
  - True/False for Reply Embeds
- Ticket `close delete` Command:
  - All of the messages' content in the ticket are sent to [pastebin](https://pastebin.com) and saved for 7 days before being automatically deleted. Only users who have access to the logs channel get to view the link and see the content for themselves
- Welcome/Goodbye Config Commands:
  - Enabled (to enable or disable the welcome/goodye messages)

## Why do you need the data?

All of the data collected is required to keep the ticketing and welcome commands functioning as expected.

## How do you use the data?

The ticketing data is used to know what server the data belongs to, the role to invite to each new support ticket, optionally the channel for tickets, optionally the logs channel to send logs to, and optionally whether to send a reply embed or ephemeral reply on successfully creating a ticket.<br>
The welcome/goodbye messages is used to greet or say goodbye to an incoming or leaving user. The data is used to know which server and channel to send it to.

## How long is the data stored for?

All data collected remains permanently, except for the `close delete` command, which the logs get deleted after 7 days.

## Do you share any data to companies or other people?

No data is shared with anyone or any companies, except to [pastebin](https://pastebin.com) for the logs.

## How can users contact you if they have concerns about your bot?

They may join the official support server, or open an issue on GitHub.

## How can users have the data removed?

Again, they may join the official support server, or open an issue on GitHub clarifying why they want the data removed.
As long as it's an acceptable reason, the data will be removed from the database.
