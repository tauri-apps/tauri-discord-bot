# tauri-discord-bot

## Commands

-   Threads: These are commands to manage the autothreads created by the bot. They can be used by the person who initiated the thread or by people with the threadlord role.

    -   `/thread rename`
    -   `/thread solve` Renames the thread to have a green checkmark at the start and sets the archive duration to 1hr.
    -   `/thread archive` Archive an active thread without marking it as solved.
    -   `/thread reopen` Reopen a thread that's been accidentally marked as solved.

## Stack

Click on the links below to view the documentation on the different parts of the bot's tech stack:

-   [TypeScript](https://www.typescriptlang.org/docs/)
-   [JellyCommands](https://github.com/ghostdevv/jellycommands)
-   [SupaBase](https://supabase.com/docs)

## Config

-   The bots main config is located at [src/config.ts](src/config.ts).

-   All secrets should be in a `.env` file, the template/example can be found [here](./.env.example).

## Contributing

All contributions are welcome, please try and make an issue first since most new features might warrant a discussion beforehand. Bug fixes probably won't need an issue and direct pull requests are ok for them.

### Running for development

1. Once you have the bot cloned and have run `pnpm install` then you need to make a .env file and fill out the fields:

    ```sh
    cp .env.example .env
    ```

2. Run the bot with `pnpm dev`

### Code Conventions

Since there is no user facing code, prefer `snake_case` for variables and function names wherever possible. Local constants follow the same, whereas global constants should be in `SCREAMING_SNAKE_CASE`.

## Deploying

The bot uses the [tsm](https://github.com/lukeed/tsm) module loader to transpile its Typescript code on the fly so there's no build step involved.

```sh
pnpm install
pnpm start
```
