import { getWelcome, setWelcome, getInviteCount } from '../../extensions.js';
import Discord from 'discord.js';
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["welcome"];
    this.permissions = {
      user: [32n, 0n],
      bot: [0n, 0n]
    };
    this.guildonly = true;
    this.description = "Welcome and goodbye system";
  }
  async run(bot, message, args) {
    const doc = await getWelcome(message.guild);
    if (!args[1]) {
      const embed = new Discord.MessageEmbed()
        .setTitle("Welcome info")
        .setDescription("Variables documented here: https://docs.gidget.andremor.dev/features/members/welcome-system")
        .addField("Welcome enabled? (enable)", doc.enabled ? "Yes" : "No")
        .addField("Channel for welcomes (channel)", doc.channelID ? ("<#" + doc.channelID + ">") : "Not established")
        .addField("Welcome message (message)", Discord.Util.splitMessage(doc.text, { maxLength: 1000 })[0])
        .addField("DM welcome enabled? (dmenable)", doc.dmenabled ? "Yes" : "No")
        .addField("DM message (dmmessage)", Discord.Util.splitMessage(doc.dmtext, { maxLength: 1000 })[0])
        .addField("Goodbye enabled? (leaveenable)", doc.leaveenabled ? "Yes" : "No")
        .addField("Channel for goodbyes (leavechannel)", doc.leavechannelID ? ("<#" + doc.leavechannelID + ">") : "Not established")
        .addField("Goodbye message (leavemessage)", Discord.Util.splitMessage(doc.leavetext, { maxLength: 1000 })[0]);
      return message.channel.send({ embeds: [embed] });
    }
    switch (args[1].toLowerCase()) {
      case "enable": {
        if (!doc.channelID) return message.channel.send("There is no established channel. Set it before starting the welcome system.");
        const channel = await message.guild.channels.fetch(doc.channelID).catch(() => { });
        if (!channel) return message.channel.send("The established channel doesn't exist.");
        if (!channel.permissionsFor(message.guild.me.id).has(["VIEW_CHANNEL", "SEND_MESSAGES"]))
          return message.channel.send("Give me permissions for send messages on the established channel before starting the welcome system.");
        const reference = !!doc.enabled;
        await setWelcome(message.guild, 0, !reference);
        await message.channel.send("The welcome system has been " + (!reference ? "Enabled" : "Disabled"));
      }
        break;
      case "channel": {
        if (!args[2]) return message.channel.send("You have not put a channel");
        const channel = message.mentions.channels.filter(e => e.guild.id === message.guild.id).first() || message.guild.channels.cache.get(args[2]) || message.guild.channels.cache.find(e => e.name === args.slice(2).join(" ")) || await message.guild.channels.fetch(args[2] || "123").catch(() => { });
        if (!channel) return message.channel.send("Invalid channel");
        if (!channel.isText()) return message.channel.send("That isn't a text-based channel");
        if (!channel.permissionsFor(message.guild.me.id).has(["VIEW_CHANNEL", "SEND_MESSAGES"])) return message.channel.send("I don't have permissions for send messages in that channel");
        await setWelcome(message.guild, 1, channel.id);
        await message.channel.send("Channel set correctly");
      }
        break;
      case "message": {
        if (!args[2]) return message.channel.send("You have not put anything");
        if (/%INVITER%/gmi.test(args.slice(2).join(" "))) {
          if (!message.guild.me.permissions.has("MANAGE_GUILD"))
            return message.channel.send("You must give me the permission to manage guild if you want the who invited the user to appear");
        }
        await setWelcome(message.guild, 2, args.slice(2).join(" "));
        await message.channel.send("Welcome message set correctly");
      }
        break;
      case "dmenable": {
        if (!doc.dmtext) return message.channel.send("There is no text for DM set. Put one in before enabling this system.");
        const reference = !!doc.dmenabled;
        await setWelcome(message.guild, 3, !reference);
        await message.channel.send("The DM welcome system has been " + (!reference ? "Enabled" : "Disabled"));
      }
        break;
      case "dmmessage": {
        if (!args[2]) return message.channel.send("You have not put anything");
        if (/%INVITER%/gmi.test(args.slice(2).join(" "))) {
          if (!message.guild.me.permissions.has("MANAGE_GUILD"))
            return message.channel.send("You must give me the permission to manage guild if you want the who invited the user to appear");
        }
        await setWelcome(message.guild, 4, args.slice(2).join(" "));
        await message.channel.send("DM message set correctly");
      }
        break;
      case "leaveenable": {
        if (!doc.leavechannelID) return message.channel.send("There is no established channel. Set it before starting the goodbye system.");
        const channel = await message.guild.channels.fetch(doc.leavechannelID).catch(() => { });
        if (!channel) return message.channel.send("The established channel doesn't exist.");
        if (!channel.permissionsFor(message.guild.me.id).has(["VIEW_CHANNEL", "SEND_MESSAGES"]))
          return message.channel.send("Give me permissions for send messages on the established channel before starting the goodbye system.");
        const reference = !!doc.leaveenabled;
        await setWelcome(message.guild, 5, !reference);
        await message.channel.send("The goodbye system has been " + (!reference ? "Enabled" : "Disabled"));
      }
        break;
      case "leavechannel": {
        if (!args[2])
          return message.channel.send("You have not put a channel");
        const channel = message.mentions.channels.filter(e => e.guild.id === message.guild.id).first() || message.guild.channels.cache.get(args[2]) || message.guild.channels.cache.find(e => e.name === args.slice(2).join(" "));
        if (!channel) return message.channel.send("Invalid channel");
        if (!channel.isText()) return message.channel.send("That isn't a text-based channel");
        if (!channel.permissionsFor(message.guild.me.id).has(["VIEW_CHANNEL", "SEND_MESSAGES"]))
          return message.channel.send("I don't have permissions for send messages in that channel");
        await setWelcome(message.guild, 6, channel.id);
        await message.channel.send("Channel set correctly");
      }
        break;
      case "leavemessage": {
        if (!args[2]) return message.channel.send("You have not put anything");
        await setWelcome(message.guild, 7, args.slice(2).join(" "));
        await message.channel.send("Goodbye message set correctly");
      }
        break;
      default:
        await message.channel.send("Invalid mode!");
    }
    if (message.guild.me.permissions.has("MANAGE_GUILD"))
      message.guild.inviteCount = await getInviteCount(message.guild).catch(() => { return {}; });
  }
}