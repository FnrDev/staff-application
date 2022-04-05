const {
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputStyle,
    TextInputBuilder
} = require('discord.js');
const client = new Client({ intents: ['Guilds', 'MessageContent', 'GuildMessages'] });
const config = require('./config.json');
require('dotenv').config();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
})

client.on('messageCreate', (message) => {
    if (message.content === '!send') {
        if (!config.admins.includes(message.author.id)) return;
        const embed = new EmbedBuilder()
        .setTitle('Apply for Staff')
        .setDescription('Click the button blow to apply for staff')
        .setColor('Red')
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('Apply')
            .setCustomId('apply')
        )
        const channel = message.guild.channels.cache.get(config.embedChannel);
        if (!channel) return;
        channel.send({
            embeds: [embed],
            components: [row]
        })
    }
})

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        // show modal
        if (interaction.customId === 'apply') {
            const modal = new ModalBuilder()
            .setTitle('Staff Application')
            .setCustomId('staff_apply')
    
            const nameComponent = new TextInputBuilder()
            .setCustomId('staff_name')
            .setLabel("What's your name")
            .setMinLength(2)
            .setMaxLength(25)
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
    
            const ageComponent = new TextInputBuilder()
            .setCustomId('staff_age')
            .setLabel("Your age")
            .setMinLength(1)
            .setMaxLength(3)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
    
            const whyYou = new TextInputBuilder()
            .setCustomId('staff_why_you')
            .setLabel("Why you should be staff here")
            .setMinLength(10)
            .setMaxLength(120)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
    
            const rows = [nameComponent, ageComponent, whyYou].map(
                (component) => new ActionRowBuilder().addComponents(component)
            )
    
            modal.addComponents(...rows);
            interaction.showModal(modal);
            // end of modal
        }

        // Accept and deny buttons
        if (interaction.customId === 'staff_accept') {
            // TODO: save user id in json or sum instead of getting id from embed footer
            const getIdFromFooter = interaction.message.embeds[0].footer.text;
            const getMember = await interaction.guild.members.fetch(getIdFromFooter);
            await getMember.roles.add(config.staffRoles).catch((err) => {
                console.error(err)
                return interaction.reply({
                    content: ":x: There was an error when a try to add roles for the user."
                })
            });
            interaction.reply({
                content: `✅ Added roles for **${getMember.user.tag}**, Accepted by ${interaction.user.tag}`
            })
            await getMember.send({
                content: `Hey ${getMember.user.tag}, You have been accepted for staff application. 🎉 **congratulations** 🎉`
            }).catch(() => {
                return interaction.message.reply(':x: There was an error when i try to send message to the user.')
            })
        }
        if (interaction.customId === 'staff_deny') {
            // TODO: save user id in json or sum instead of getting id from embed footer
            const getIdFromFooter = interaction.message.embeds[0].footer.text;
            const getMember = await interaction.guild.members.fetch(getIdFromFooter);
            // TODO: add modal for reason of rejection
            await getMember.send({
                content: `Hey ${getMember.user.tag} sorry you have been rejected for staff application.`
            }).catch(e => {})
            interaction.reply({
                content: `:x: ${getMember.user.tag} has been rejected by ${interaction.user.tag}.`
            })
        }
    }
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'staff_apply') {
            const staffName = interaction.fields.getTextInputValue('staff_name');
            const staffAge = interaction.fields.getTextInputValue('staff_age');
            const staffWhyYou = interaction.fields.getTextInputValue('staff_why_you');
            if (isNaN(staffAge)) {
                return interaction.reply({
                    content: ":x: Your age must be a number, please resend the form.",
                    ephemeral: true
                })
            }
            interaction.reply({
                content: '✅ Your staff application has been submit successfully.',
                ephemeral: true
            })
            const staffSubmitChannel = interaction.guild.channels.cache.get(config.submitChannel);
            if (!staffSubmitChannel) return;
            const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setColor('Blue')
            .setTimestamp()
            .setFooter({ text: interaction.user.id })
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                {
                    name: "Name:",
                    value: staffName
                },
                {
                    name: "Age:",
                    value: staffAge
                },
                {
                    name: "Why you should be staff here:",
                    value: staffWhyYou
                }
            )
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('staff_accept')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('staff_deny')
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger)
            )
            staffSubmitChannel.send({
                embeds: [embed],
                components: [row]
            })
        }
    }
})

client.login(process.env.TOKEN);