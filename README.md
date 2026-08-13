# tauri-discord-bot

This bot is based off [Svelte Bot](https://github.com/pngwn/svelte-bot/). It's hosted on a DigitalOcean App instance that will automatically detect any updates to the `main` branch and deploy those changes.

## Configuration

-   Environment: All secrets should be in a `.env` file. The template/example can be found at [env.example](./.env.example)
    -   `NODE_ENV`: Any value other than `production` will set the bot use the dev IDs defined below
    -   `DISCORD_TOKEN`: The bot's private token from Discord
    -   `DEV_GUILD_ID`: Guide/server to test the bot in
    -   `DEV_ADMIN_ROLE`: A role or user ID that the bot will consider an administrator
    -   `DEV_HELP_CHANNEL`: Channel(s) to automatically thread any messages in (see the Threads functionality below)
    -   `DEV_SUPPORT_FORUM_CHANNEL`: Support forum channel id
-   `src/config.ts`: The bots main config is located at [src/config.ts](src/config.ts)
    -   `ADMIN_ROLES`: Role or user IDs that the bot will consider administrators

## Events

-   x

## Commands

-   `thread`: These are commands to manage forum threads. They can be used by the person who initiated the thread or by people/roles defined in `THREAD_ADMIN_IDS`.
    -   `/thread solve`: Replaces the `unsolved` tag with `solved`.

## Stack

Click on the links below to view the documentation on the different parts of the bot's tech stack:

-   [TypeScript](https://www.typescriptlang.org/docs/)
-   [JellyCommands](https://github.com/ghostdevv/jellycommands)

## Contributing

All contributions are welcome, please try and make an issue first since most new features might warrant a discussion beforehand. Bug fixes probably won't need an issue and direct pull requests are ok for them.

### Running for development

1. Once you have the bot cloned then you need to make a .env file and fill out the fields:

    ```sh
    cp .env.example .env
    ```

2. Run the bot with `pnpm dev`

## Deploying

The bot uses Node.js' built-in TypeScript support so there's no build step involved.

```sh
pnpm start
```
