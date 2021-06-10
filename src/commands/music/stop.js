export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["leave", "end"];
    this.description = "Stop the queue";
    this.guildonly = true;
    this.permissions = {
      user: [0, 0],
      bot: [0, 0],
    };
  }
  // eslint-disable-next-line require-await
  async run(bot, message) {
    const serverQueue = message.guild.queue;
    if (serverQueue && serverQueue.inseek) return;
    const musicVariables = message.guild.musicVariables;
    if (!message.member.voice.channel)
      return message.channel.send(
        "You need to be in a voice channel to stop music!"
      );
    if (!musicVariables)
      return message.channel.send(
        "There is nothing playing that I could stop."
      );
    if (musicVariables && musicVariables.other) {
      if (!message.member.hasPermission("MANAGE_CHANNELS")) {
        if (
          message.member.voice.channel.members.filter((e) => !e.user.bot).size >
          1
        ) {
          return message.channel.send(
            "Only a member with permission to manage channels can stop queuing. Being alone also works."
          );
        }
      }
      if (musicVariables.loop) musicVariables.loop = false;
      return musicVariables.connection.dispatcher.destroy();
    }
    if (!serverQueue)
      return message.channel.send(
        "There is nothing playing that I could stop."
      );

    if (serverQueue.voiceChannel.id !== message.member.voice.channelID)
      return message.channel.send("I'm on another voice channel!");
    if (!message.member.hasPermission("MANAGE_CHANNELS")) {
      if (
        message.member.voice.channel.members.filter((e) => !e.user.bot).size > 1
      ) {
        return message.channel.send(
          "Only a member with permission to manage channels can stop queuing. Being alone also works."
        );
      }
    }
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    if (message.guild.me.hasPermission("ADD_REACTIONS")) {
      message.react("✅").catch(() => {});
    } else {
      message.channel.send("The song has been stopped.").catch(() => {});
    }
  }
}
