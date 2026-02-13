const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../../utils/api');
const { OWNER_DISCORD_ID } = require('../../config');

// Broadcast templates
const TEMPLATES = {
  arena_announcement: {
    title: '⚔️ New Feature: Arena Game Mode Support!',
    description:
      "We're excited to announce that Scuttle now supports Arena game mode tracking!",
    fields: [
      {
        name: '📊 Arena Stats',
        value:
          'Track your arena performance with:\n• `/arena stats daily` - Last 24 hours\n• `/arena stats weekly` - Last 7 days\n• `/arena stats monthly` - Last 30 days',
        inline: false,
      },
      {
        name: '🏆 Arena Rankings',
        value:
          'Compete with your guild members:\n• `/arena rankings weekly`\n• `/arena rankings monthly`',
        inline: false,
      },
      {
        name: '📈 Arena Metrics Tracked',
        value:
          '• Average Placement\n• Win Rate\n• K/D/A Stats\n• Damage to Champions\n• Placement Finishes (1st, 2nd, 3rd, 4th)',
        inline: false,
      },
    ],
    color: 0x9d4edd, // Purple color for arena
    footer: 'Start tracking your arena stats today!',
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('broadcast')
    .setDescription('Send a broadcast message to all guilds (Owner only)')
    .addStringOption((option) =>
      option
        .setName('template')
        .setDescription('The message template to broadcast')
        .setRequired(true)
        .addChoices(
          { name: 'Arena Announcement', value: 'arena_announcement' }
          // Add more templates here as needed
        )
    )
    .addStringOption((option) =>
      option
        .setName('test_guild_id')
        .setDescription('Test mode: Only send to this guild ID (optional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    // Check if user is the bot owner
    if (interaction.user.id !== OWNER_DISCORD_ID) {
      const embed = new EmbedBuilder()
        .setTitle('❌ Permission Denied')
        .setDescription('This command is only available to the bot owner.')
        .setColor(0xff0000);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const templateName = interaction.options.getString('template');
      const testGuildId = interaction.options.getString('test_guild_id');
      const template = TEMPLATES[templateName];

      if (!template) {
        throw new Error(`Template '${templateName}' not found.`);
      }

      // Fetch all guilds with main channels from API
      const response = await api.get('/guilds/with-main-channel');
      let guilds = response.data.data.guilds;

      if (!guilds || guilds.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle('⚠️ No Guilds Found')
          .setDescription('No guilds with main channels configured.')
          .setColor(0xffa500);

        return interaction.followUp({ embeds: [embed], ephemeral: true });
      }

      // If test mode, filter to only the specified guild
      if (testGuildId) {
        guilds = guilds.filter((g) => g.guild_id === testGuildId);
        if (guilds.length === 0) {
          const embed = new EmbedBuilder()
            .setTitle('⚠️ Test Guild Not Found')
            .setDescription(
              `Guild ID ${testGuildId} not found or has no main channel configured.`
            )
            .setColor(0xffa500);

          return interaction.followUp({ embeds: [embed], ephemeral: true });
        }
      }

      // Create the broadcast embed
      const broadcastEmbed = new EmbedBuilder()
        .setTitle(template.title)
        .setDescription(template.description)
        .setColor(template.color)
        .setFooter({ text: template.footer });

      if (template.fields) {
        broadcastEmbed.addFields(template.fields);
      }

      // Send to all guilds and track results
      let successCount = 0;
      let failureCount = 0;
      const failures = [];

      for (const guildData of guilds) {
        try {
          const guild = await interaction.client.guilds.fetch(
            guildData.guild_id
          );
          const channel = await guild.channels.fetch(
            guildData.main_channel_id
          );

          if (channel && channel.isTextBased()) {
            await channel.send({ embeds: [broadcastEmbed] });
            successCount++;
          } else {
            failureCount++;
            failures.push(
              `${guildData.name}: Channel not found or not text-based`
            );
          }
        } catch (error) {
          failureCount++;
          failures.push(`${guildData.name}: ${error.message}`);
        }
      }

      // Send summary to admin
      const summaryEmbed = new EmbedBuilder()
        .setTitle(testGuildId ? '📡 Test Broadcast Complete' : '📡 Broadcast Complete')
        .setDescription(
          `${testGuildId ? '**TEST MODE** - ' : ''}Broadcast sent to ${successCount}/${guilds.length} guild${guilds.length !== 1 ? 's' : ''}.`
        )
        .addFields(
          { name: '✅ Successful', value: `${successCount}`, inline: true },
          { name: '❌ Failed', value: `${failureCount}`, inline: true }
        )
        .setColor(failureCount === 0 ? 0x00ff00 : 0xffa500);

      if (failures.length > 0) {
        const failureText =
          failures.slice(0, 10).join('\n') +
          (failures.length > 10
            ? `\n... and ${failures.length - 10} more`
            : '');
        summaryEmbed.addFields({
          name: 'Failures',
          value: failureText,
          inline: false,
        });
      }

      await interaction.followUp({ embeds: [summaryEmbed], ephemeral: true });
    } catch (error) {
      console.error('❌ Error executing broadcast:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Broadcast Error')
        .setDescription(error.message)
        .setColor(0xff0000);

      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
