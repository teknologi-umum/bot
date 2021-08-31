# Privacy Policy

**TL;DR**

We collect your user ID, username, first name, last name, group chat ID and information about it,
and your message if there is any error happened. It will ease our bug-fixing times.
Then we send that to Sentry. Nothing dangerous and concerning about that.

## What information do we collect?

We collect your Telegram user ID, username (if any), first name (if any), and last name (if any).
We also collect the group chat ID, group chat name, group chat username, group chat type
(supergroup, channel, group, or private), and your message on the group.
All of that is collected ONLY IF there is any error happened.

Even if there is an error happened, there should be a message of:

> uh oh, something went wrong. ask the devs to check their logs.

On some commands, we collect just your Telegram user ID, username (if any) first name (if any), last name (if any),
and group chat ID to be able to process some commands like `/dukun`, `/snap`, and `/quiz`.

Those data is open for public via the Telegram API. It's not exposing your password or
any credentials-related information. Even your phone number!

## What do we use your information for?

Bug fix, pin pointing where the error came from.
`/dukun` command needs your ID and name to indicate who's who.
That's it.

## How do we protect your information?

For error logging, we use a third party service called Sentry. They uses SSL connection to send data.
You can read about [Sentry's privacy policy here](https://sentry.io/privacy/).

For other cases, we use MongoDB Atlas for our NoSQL database needs. They also uses SSL connectoion.
You can read about [MongoDB's privacy policy here](https://www.mongodb.com/legal/privacy-policy).
They did not collect what's inside the database, so we are in good hands.

## Do you log the whole chat data?

No. We don't have enough resources (databases & memory storage space) to do that.
Everything you see on this repository is literally what runs the bot.
