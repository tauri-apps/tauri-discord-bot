# tauri-discord-bot

This bot is based off of the amazing [Svelte Bot](https://github.com/pngwn/svelte-bot/). It's hosted on a DigitalOcean App instance that will automatically detect any updates to the `main` branch and deploy those changes.

## Configuration

-   Environment: All secrets should be in a `.env` file. The template/example can be found at [env.example](./.env.example)
    -   `NODE_ENV`: Any value other than `production` will set the bot use the dev IDs defined below
    -   `DISCORD_TOKEN`: The bot's private token from Discord
    -   `DEV_GUILD_ID`: Guide/server to test the bot in
    -   `DEV_ADMIN_ROLE`: A role or user ID that the bot will consider an administrator
    -   `DEV_HELP_CHANNEL`: Channel(s) to automatically thread any messages in (see the Threads functionality below)
-   `src/config.ts`: The bots main config is located at [src/config.ts](src/config.ts)
    -   `ADMIN_ROLES`: Role or user IDs that the bot will consider administrators
    -   `BOT_DEVS`: Currently the same functionality as `ADMIN_ROLES`
    -   `AUTO_THREAD_CHANNELS`: Channel(s) that automatically thread any messages sent in them (extends `HELP_CHANNELS` below)
    -   `HELP_CHANNELS`: Channel(s) that in addition to being auto threaded also come with issue handling capabilities

## Events

-   `on_message_auto_thread`: Monitors the channels set in `AUTO_THREAD_CHANNELS` and automatically turns any messages posted there into their own threads

## Commands

-   `thread`: These are commands to manage the autothreads created by the bot. They can be used by the person who initiated the thread or by people/roles defined in the role.
    -   `/thread rename`: Renames the current thread
    -   `/thread solve`: Removes ? and adds ✅ at the beginning of the thread name and sets the archive duration to 1hr
    -   `/thread archive`: Archive an active thread without marking it as solved
    -   `/thread reopen`: Reopen a thread that's been accidentally marked as solved
-   `threads`: These are commands to manage all threads in the guild
    -   `/threads list`: Lists currently active threads in the channel the command was ran in. If ran in a help channel it will only output the unsolved threads

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

2. Run the bot with `yarn dev`

### Code Conventions

Since there is no user facing code, prefer `snake_case` for variables and function names wherever possible. Local constants follow the same, whereas global constants should be in `SCREAMING_SNAKE_CASE`.

## Deploying

The bot uses the [tsm](https://github.com/lukeed/tsm) module loader to transpile its Typescript code on the fly so there's no build step involved.

```sh
yarn start
```
