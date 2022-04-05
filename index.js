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
require('dotenv').config();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
})

const admins = ['596227913209217024']; // users ids that allowed to use '!send' command
const submitChannel = '960942616667648052' // Channel id for submitted forms
const embedChannel = '960944053149642792' // Channel id for embed to sent to

client.on('messageCreate', (message) => {
    if (message.content === '!send') {
        if (!admins.includes(message.author.id)) return;
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
        const channel = message.guild.channels.cache.get(embedChannel);
        channel.send({
            embeds: [embed],
            components: [row]
        })
    }
})

client.on('interactionCreate', (interaction) => {
    if (interaction.isButton()) {
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
            const staffSubmitChannel = interaction.guild.channels.cache.get(submitChannel);
            if (!staffSubmitChannel) return;
            staffSubmitChannel.send(`**New Application from ${interaction.user} (\`${interaction.user.id}\`)**\n\nStaff name: ${staffName}\nStaff Age: ${staffAge}\nWhy you should be staff?: ${staffWhyYou}`)
        }
    }
})

client.login(process.env.TOKEN);