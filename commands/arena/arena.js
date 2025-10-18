const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../../utils/api');
const { getLastSunday } = require('../../utils/date');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('arena')
    .setDescription('Commands related to arena game mode')
    .addSubcommandGroup((group) =>
      group
        .setName('stats')
        .setDescription('View arena statistics for a summoner')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('daily')
            .setDescription(
              "Displays a summoner's arena stats for games played in the last 24 hours."
            )
            .addStringOption((option) =>
              option
                .setName('summoner_name')
                .setDescription('The name of the summoner')
                .setRequired(true)
            )
            .addStringOption((option) =>
              option.setName('tag').setDescription('Riot Tag').setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('weekly')
            .setDescription(
              "Displays a summoner's arena stats for games played in the last 7 days."
            )
            .addStringOption((option) =>
              option
                .setName('summoner_name')
                .setDescription('The name of the summoner')
                .setRequired(true)
            )
            .addStringOption((option) =>
              option.setName('tag').setDescription('Riot Tag').setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('monthly')
            .setDescription(
              "Displays a summoner's arena stats for games played in the last 30 days."
            )
            .addStringOption((option) =>
              option
                .setName('summoner_name')
                .setDescription('The name of the summoner')
                .setRequired(true)
            )
            .addStringOption((option) =>
              option.setName('tag').setDescription('Riot Tag').setRequired(true)
            )
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('rankings')
        .setDescription('View arena leaderboards')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('weekly')
            .setDescription('Displays weekly arena rankings for the top 5 summoners.')
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('monthly')
            .setDescription('Displays monthly arena rankings for the top 5 summoners.')
        )
    ),

  async execute(interaction) {
    if (!interaction.guildId) {
      const embed = new EmbedBuilder()
        .setTitle('❌ Command Error')
        .setDescription('This command must be used in a server.')
        .setColor(0xff0000);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.deferReply();

    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    if (subcommandGroup === 'stats') {
      return this.handleStats(interaction, subcommand);
    } else if (subcommandGroup === 'rankings') {
      return this.handleRankings(interaction, subcommand);
    }
  },

  async handleStats(interaction, subcommand) {
    try {
      const range =
        subcommand === 'daily' ? 1 : subcommand === 'weekly' ? 7 : 30;
      const queueType = 'arena';
      const guildId = interaction.guildId;
      const summonerName = interaction.options.getString('summoner_name');
      const tag = interaction.options.getString('tag');
      const summonerRiotId = `${summonerName} #${tag}`;

      // Step 1: Get summoner's PUUID
      let puuid;
      try {
        const puuidResponse = await api.get(`/riot/puuid`, {
          params: { riotId: summonerRiotId },
        });
        puuid = puuidResponse.data.data.puuid;
      } catch (error) {
        if (error.response?.status === 404) {
          throw new Error(
            `Error getting arena stats for summoner **${summonerRiotId}**. Make sure this user exists.`
          );
        }
        throw error;
      }

      // Step 2: Check if summoner exists in guild
      const guildSummonersResponse = await api.get(
        `/summoners/guild/${guildId}`
      );
      const summonersInGuild = guildSummonersResponse.data.data || [];

      if (summonersInGuild.length === 0) {
        throw new Error(
          'There are currently no summoners in your guild. Add a summoner with `/summoners add {RIOT ID}` to view their stats.'
        );
      }

      const isSummonerInGuild = summonersInGuild.some(
        (summoner) => summoner.puuid === puuid
      );
      if (!isSummonerInGuild) {
        throw new Error(
          `Summoner **${summonerRiotId}** is not part of your guild. Add them with \`/summoners add {RIOT ID}\` to view their stats.`
        );
      }

      // Step 3: Check if summoner data is cached
      const cacheResponse = await api.get(`/summoners/cache/${puuid}`, {
        params: { range, name: summonerRiotId },
      });

      if (!cacheResponse.data.data.isCached) {
        throw new Error(
          `Summoner **${summonerRiotId}** has been added recently and does not have match data yet. Please allow about 1 hour.`
        );
      }

      // Step 4: Fetch summoner arena stats
      let stats;
      try {
        const statsResponse = await api.get(`/stats/pretty/${puuid}`, {
          params: { range, queueType },
        });
        stats = statsResponse.data.data.stats;
      } catch (error) {
        if (error.response?.status === 404) {
          throw new Error(`No arena stats found for **${summonerRiotId}**.`);
        }
        throw error;
      }

      // Step 5: Create stats embed
      const embed = new EmbedBuilder()
        .setTitle(
          `⚔️ ${summonerRiotId}'s Arena stats for the past ${range} day(s)`
        )
        .setDescription(
          `Collected stats for **${summonerRiotId}**'s Arena matches over the past ${range} day(s).`
        )
        .setColor(0x9d4edd); // Purple color for arena

      if (stats && Object.keys(stats).length > 0) {
        for (const [key, value] of Object.entries(stats)) {
          embed.addFields({ name: key, value: value.toString(), inline: true });
        }
      } else {
        throw new Error(
          `Error getting arena stats for summoner **${summonerRiotId}**. Make sure this user has played arena games.`
        );
      }

      embed.setFooter({
        text: '📝 Note: match data is updated hourly on the hour.',
      });

      await interaction.followUp({ embeds: [embed] });
    } catch (error) {
      console.error('❌ Error fetching arena stats:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Arena Stats Command Error')
        .setDescription(error.message)
        .setColor(0xff0000);

      await interaction.followUp({ embeds: [errorEmbed] });
    }
  },

  async handleRankings(interaction, subcommand) {
    try {
      const now = new Date();
      let startDate;
      const queueType = 'arena';

      if (subcommand === 'weekly') {
        // Determine the previous Sunday
        startDate = getLastSunday();
      } else if (subcommand === 'monthly') {
        // First day of the current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split('T')[0];
      }

      let rankings;
      try {
        const response = await api.get('/rankings/pretty', {
          params: {
            guildId: interaction.guildId,
            startDate: startDate,
            queueType: queueType,
          },
        });
        rankings = response.data.data.rankings;
      } catch (error) {
        if (error.response?.status === 404) {
          throw new Error(
            'No arena rankings data found. Please ensure summoners are added to your server using `/summoners add Name Tag` and have played arena games.'
          );
        }
        throw error; // Rethrow any other errors
      }

      const today = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const startDateObj = new Date(startDate);
      const formattedStartDate = startDateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      const embed = new EmbedBuilder()
        .setTitle(`⚔️ Top Arena Players (${formattedStartDate} - ${today})`)
        .setDescription(
          `Top arena rankings in ${interaction.guild?.name || 'this guild'}`
        )
        .setColor(0x9d4edd); // Purple color for arena

      for (const [statName, topEntries] of Object.entries(rankings)) {
        const formattedEntries = topEntries
          .map((entry, i) => `${i + 1}. ${entry.value} - ${entry.name}`)
          .join('\n');

        embed.addFields({
          name: statName,
          value: formattedEntries,
          inline: true,
        });
      }

      embed.setFooter({ text: 'Data is updated hourly.' });

      await interaction.followUp({ embeds: [embed] });
    } catch (error) {
      console.error('❌ Error fetching arena rankings:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Arena Rankings Command Error')
        .setDescription(error.message)
        .setColor(0xff0000);

      await interaction.followUp({ embeds: [errorEmbed] });
    }
  },
};
