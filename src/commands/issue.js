const {
  sendReply,
  hasFlagInParts,
  getFlagValueInParts,
  parseString,
} = require("../utils");

const getRelatedTemplate = (project) => {
  try {
    return {
      tauri: "bug_report.md",
    }[project];
  } catch (error) {
    return "";
  }
};

module.exports = {
  name: "issue",
  aliases: ["i"],
  desc: "Generates a Github issue link",
  examples: ['[!i tauri "Issue title" --label bug]'],
  async execute(message, context, parts) {
    let project;
    let title;
    try {
      project = parts[0];
      title = encodeURIComponent(
        parseString(message.content) ? parseString(message.content) : parts[1]
      );
    } catch (error) {
      sendReply(
        "Command failure: '!issue'",
        "positional args `project` and `title` are required",
        message,
        context
      );
      return
    }

    const label = hasFlagInParts("label", parts)
      ? getFlagValueInParts("label", parts)
      : "bug";

    const link = `https://github.com/tauri-apps/${project}/issues/new?assignees=&labels=${label}&template=${getRelatedTemplate(
      project
    )}&title=${title}`;

    sendReply("Create an issue", link, message, context);
    // const embed = getEmbeddedMessage(
    //   message,
    //   context,
    //   "Create an issue"
    // ).setDescription(link);

    // if (context.isMentioned) {
    //   await message.channel.send({ embed });
    // } else {
    //   await message.author.send({ embed });
    // }

    await message.react("📨");
  },
};

const getCommandInfo = (prefix, command) => {
  return `${prefix}${[command.name, ...command.aliases].join(` or ${prefix}`)}`;
};
