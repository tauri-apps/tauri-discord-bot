/*

This is just a template for creating other modals

*/

import { Modal, TextInputComponent, MessageActionRow, ModalSubmitInteraction, MessageButton, InteractionReplyOptions, ButtonInteraction } from "discord.js";
import { wrap_in_embed } from "../../utils/embed_helpers";
import { MessageOptions } from "child_process";

export const someUniqueModalName = {
    // Create a modal to show to the user
    modal: new Modal()
        .setTitle('First the basics')
        .addComponents(new MessageActionRow()
            .addComponents(new TextInputComponent()
                .setCustomId('tauri_info')
                .setLabel("Output of the tauri info command")
                .setStyle('PARAGRAPH'))),
    run: function (interaction: ModalSubmitInteraction) {
        // This function runs when the modal is submitted
        // Create a message to send to the user
        let msg = wrap_in_embed('Something') as InteractionReplyOptions
        // Reply to the user
        interaction.reply(msg)
    },
    options: {
        'yes': async function (interaction: ButtonInteraction) {
            // Create a message to send to the user
            let msg = wrap_in_embed("The user clicked yes") as MessageOptions
            // Send the message to the user
            await interaction.channel.send(msg)
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
        'no': async function (interaction: ButtonInteraction) {
            // Create a message to send to the user
            let msg = wrap_in_embed("The user clicked no") as MessageOptions
            // Send the message to the user
            await interaction.channel.send(msg)
            // Create a MessageRow where the chosen interaction is disabled
            const origRow = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('auto_assist-start-no')
                    .setLabel('No')
                    .setStyle('DANGER')
                    .setEmoji('⚠️')
                    .setDisabled(true)
            )
            // Update the original interaction message to make it clear which option the user picked
            await interaction.update({ components: [origRow] })
        }
    }
}
