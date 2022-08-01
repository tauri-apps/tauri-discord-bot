import { Modal, TextInputComponent, MessageActionRow, ModalSubmitInteraction, MessageButton, InteractionReplyOptions, Message, ButtonInteraction, ThreadChannel, MessageEditOptions } from "discord.js";
import { wrap_in_embed } from "../../utils/embed_helpers";
import { solve_thread } from "../../utils/threads";
import { MessageOptions } from "child_process";
import fetch from "node-fetch";

export const assistStartModal = {
    // Create a modal to show to the user
    modal: new Modal()
        .setTitle('First the basics')
        .addComponents(new MessageActionRow()
            .addComponents(new TextInputComponent()
                .setCustomId('tauri_info')
                .setLabel("Output of the tauri info command")
                .setStyle('PARAGRAPH'))),
    // Used to process the modals submission
    run: async function (interaction: ModalSubmitInteraction) {
        // Stores all problems found
        let problems: [Problem?] = []
        // Metadata url
        const metadataUrl = "https://raw.githubusercontent.com/tauri-apps/tauri/dev/tooling/cli/metadata.json"
        const response = await fetch(metadataUrl, {
            headers: {
                Accept: 'application/json'
            }
        })
        const metadata = await response.json() as LooseObject
        // Npmjs url of the @tauri-apps/api package
        const apiUrl = 'https://registry.npmjs.org/@tauri-apps/api'
        // Get the api metadata
        const res = await fetch(apiUrl, {
            headers: {
                Accept: 'application/vnd.npm.install-v1+json'
            }
        })
        // Convert the response to json
        const apiMeta = await res.json() as LooseObject
        // Add the latest api version to the metadata object
        metadata.api = Object.keys(apiMeta.versions).at(-1)

        // Get the tauri_info output from the modal
        const tauriInfoText = interaction.fields.getTextInputValue('tauri_info')
            .split('\n')
            .map(v => v.trim())
            .filter(v => v !== '')
        // Used to store the tauri_info as an object
        let tauriInfo: LooseObject = {}
        // Current section being handled
        let section = ''
        tauriInfoText.forEach((val) => {
            if (val === 'Environment') {
                section = 'environment'
                if (!(section in tauriInfo))
                    tauriInfo[section] = {}
                return
            }
            if (val === 'Packages') {
                section = 'packages'
                if (!(section in tauriInfo))
                    tauriInfo[section] = {}
                return
            }
            if (val === 'App') {
                section = 'app'
                if (!(section in tauriInfo))
                    tauriInfo[section] = {}
                return
            }
            if (val === 'App directory structure') {
                section = 'appDirectoryStructure'
                if (!(section in tauriInfo))
                    tauriInfo[section] = {}
                return
            }
            if (section === 'environment' && val.startsWith('›')) {
                tauriInfo[section][val.slice(2).split(':')[0]] = val.slice(2).split(':').slice(1).join('').trim()
            }
            if (section === 'packages' && val.startsWith('›')) {
                tauriInfo[section][val.slice(2).split(':')[0]] = val.slice(2).split(':').slice(1).join('').trim().replace(',', '')
            }
            if (section === 'app' && val.startsWith('›')) {
                tauriInfo[section][val.slice(2).split(':')[0]] = val.slice(2).split(':').slice(1).join('').trim()
            }
            if (section === 'appDirectoryStructure' && val.startsWith('›')) {
                // TODO: Analyze the directory structure
            }
        })

        // Check if any information is missing
        if (!('environment' in tauriInfo) || !('packages' in tauriInfo) || !('app' in tauriInfo)) {
            problems.push({
                info: `Your \`tauri info\` output could not be parsed, did you enter it correctly?`,
                solutions: ['Run `tauri info` retry asking for help']
            })
        } else {
            // Check if tauri and tauri-build are the same versions
            /*
            if (tauriInfo.packages['tauri [RUST]'] && tauriInfo.packages['tauri [RUST]'] !== tauriInfo.packages['tauri-build [RUST]']) {
                problems.push({
                    info: `Your \`tauri\` and \`tauri-build\` dependencies versions do not appear to match, make sure they are both using \`${metadata.tauri}\``,
                    solutions: ['Edit `Cargo.toml` that all versions are correct', 'Run `cargo update`']
                })
            }
            */

            // Check if the CLI is the latest version
            if (tauriInfo.packages['@tauri-apps/cli [NPM]'] && tauriInfo.packages['@tauri-apps/cli [NPM]'] !== metadata['cli.js'].version && tauriInfo.packages['@tauri-apps/cli [NPM]'] !== 'Not installed!') {
                problems.push({
                    info: `\`@tauri-apps/cli [NPM]\` appears to be outdated, your version is \`${tauriInfo.packages['@tauri-apps/cli [NPM]']}\`, the current version is \`${metadata['cli.js'].version}\``,
                    solutions: ['Run `yarn add @tauri-apps/cli`']
                })
            }

            // Check if the API is the latest version
            if (tauriInfo.packages['@tauri-apps/api [NPM]'] && tauriInfo.packages['@tauri-apps/api [NPM]'] !== metadata.api && tauriInfo.packages['@tauri-apps/api [NPM]'] !== 'Not installed!') {
                problems.push({
                    info: `\`@tauri-apps/api\` [NPM] appears to be outdated, your version is \`${tauriInfo.packages['@tauri-apps/api [NPM]']}\`, the current version is \`${metadata.api}\``,
                    solutions: ['Run `yarn add @tauri-apps/api`']
                })
            }

            // Check if tauri is the latest version
            if (tauriInfo.packages['tauri [RUST]'] && tauriInfo.packages['tauri [RUST]'] !== metadata.tauri) {
                problems.push({
                    info: `\`tauri [RUST]\` appears to be outdated, your version is \`${tauriInfo.packages['tauri [RUST]']}\`, the current version is \`${metadata.tauri}\``,
                    solutions: ['Run `cargo update`']
                })
            }

            // Check if tauri-build is the latest version
            if (tauriInfo.packages['tauri-build [RUST]'] && tauriInfo.packages['tauri-build [RUST]'] !== metadata['tauri-build']) {
                problems.push({
                    info: `\`tauri-build [RUST]\` appears to be outdated, your version is \`${tauriInfo.packages['tauri-build [RUST]']}\`, the current version is \`${metadata['tauri-build']}\``,
                    solutions: ['Run `cargo update`']
                })
            }
        }

        // Store the response text
        let text = ''
        // Add Problems header
        if (problems.length > 0) {
            text = `${text}**Problems**`
        }
        const infos: [String?] = []
        // Add problems
        problems.forEach((val) => {
            if (!infos.includes(val.info)) {
                infos.push(val.info)
                text = `${text}\n- ${val.info}`
            }
        })
        // Add Solutions header
        if (problems.length > 0) {
            text = `${text}\n\n**Solutions**`
        }
        const solutions: [String?] = []
        let counter = 0
        // Add solutions
        problems.forEach((val) => {
            val.solutions.forEach((sol) => {
                if (!solutions.includes(sol)) {
                    counter += 1
                    solutions.push(sol)
                    text = `${text}\n${counter}. ${sol}`
                }
            })
        })
        if (text.length === 0) {
            // If the text is still empty, there were no suggestions
            text = 'Looks good as far as I can tell 🤷‍♂️\n\nClick *Continue* to move on to the next step.'
        } else {
            // If there was text we ask an appropriate question based on what the next buttons are
            text = `${text}\n\n**Did this fix your issue?**`
        }
        // Add the users tauri info output to the message
        text = `${interaction.fields.getTextInputValue('tauri_info')}\n\n${text}`
        // Create the response message
        let msg = wrap_in_embed(text) as InteractionReplyOptions
        // Create the MessageActionRow
        const row = new MessageActionRow()
        if (problems.length > 0) {
            // If we had problems, add next options
            row.addComponents(
                new MessageButton()
                    .setCustomId('auto_assist-start-yes')
                    .setLabel('Yes')
                    .setStyle('SUCCESS')
                    .setEmoji('✅'),
                new MessageButton()
                    .setCustomId('auto_assist-start-no')
                    .setLabel('No')
                    .setStyle('DANGER')
                    .setEmoji('⚠️'),
            )
        } else {
            // If we didn't have any problems, let the user continue
            row.addComponents(
                new MessageButton()
                    .setCustomId('auto_assist-start-continue')
                    .setLabel('Continue')
                    .setStyle('PRIMARY')
                    .setEmoji('▶️'),
            )
        }
        // Add the MessageActionRow
        msg.components = [row];
        // Send the response
        await interaction.reply(msg)
    },
    options: {
        // Used when the users problem was resolved
        'yes': async function (interaction: ButtonInteraction) {
            // Get the channel as a ThreadChannel
            const thread = interaction.channel as ThreadChannel
            // Get the first message in the thread
            const start_message = await thread.fetchStarterMessage();
            // Get the first 2 messages after the start message
            const messages = await thread.messages.fetch({
                limit: 2,
                after: start_message.id,
            });
            // Filter the messages to find the bot message with the buttons
            const bot_message = messages
                .filter((m) => m.components.length > 0)
                .first() as Message

            // Create a reponse to the user
            const msg = wrap_in_embed("Yay! In that case I'll go ahead and mark the thread as solved for you 🥳") as MessageOptions
            // Send the response
            await interaction.channel.send(msg)

            try {
                // Attempt to solve the channel
                await solve_thread(thread);
                // Change the message
                const successMsg = wrap_in_embed(
                    'Thread solved. Thank you everyone! 🥳',
                ) as MessageEditOptions;
                // Change the button
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('reopen')
                        .setLabel('Mark as Unsolved')
                        .setStyle('SECONDARY')
                        .setEmoji('❔'),
                    ...bot_message.components[0].components.filter(val => val.customId !== 'solve')
                )
                successMsg.components = [row];
                // Update the message
                await bot_message.edit(successMsg)
            } catch { }

            // Create a MessageRow where the chosen interaction is disabled
            const origRow = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('auto_assist-start-yes')
                    .setLabel('Yes')
                    .setStyle('SUCCESS')
                    .setEmoji('✅')
                    .setDisabled(true)
            )
            // Update the original interaction message to make it clear which option the user picked
            await interaction.update({ components: [origRow] })
        },
        // Used when the users issue wasn't resolved by the suggested solutions
        'no': async function (interaction: ButtonInteraction) {
            // Create a response message
            let msg = wrap_in_embed("Seems like we've hit a dead end 😥\n\nPlease wait for a human to provide more assistance") as MessageOptions
            // Send the message
            await interaction.channel.send(msg)
            // Create a MessageActionRow where the chosen action is disabled
            const origRow = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('auto_assist-start-no')
                    .setLabel('No')
                    .setStyle('DANGER')
                    .setEmoji('⚠️')
                    .setDisabled(true)
            )
            // Disable the chosen action
            await interaction.update({ components: [origRow] })
        },
        // Used when no problems were found and the user should just be allowed to continue
        'continue': async function (interaction: ButtonInteraction) {
            // Create a response message
            let msg = wrap_in_embed("Seems like we've hit a dead end 😥\n\nPlease wait for a human to provide more assistance") as MessageOptions
            // Send the message
            await interaction.channel.send(msg)
            // Create a MessageActionRow where the chosen action is disabled
            const origRow = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('auto_assist-start-continue')
                    .setLabel('Continue')
                    .setStyle('PRIMARY')
                    .setEmoji('▶️')
                    .setDisabled(true)
            )
            // Disable the chosen action
            await interaction.update({ components: [origRow] })
        }
    }
}
