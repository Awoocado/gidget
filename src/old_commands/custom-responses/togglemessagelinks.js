import { getMessageLinksConfig, setMessageLinksConfig } from "../../extensions.js";
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "This command enables message link detection so that a message from the bot appears with its content."
    this.guildonly = true;
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 0n]
    }
  }
  async run(bot, message) {
    const thing = await getMessageLinksConfig(message.guild);
    await setMessageLinksConfig(message.guild, !thing.enabled);
    await message.channel.send("You have " + (thing.enabled ? "enabled" : "disabled") + " the message link detection system");
  }
}