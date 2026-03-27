const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const DONO_ID = process.env.DONO_ID;
const PIX = process.env.PIX;

// 🔒 anti duplicação
const criando = new Set();

client.once('ready', () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);
});

// ================= PAINEL DRIP
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  if (message.content === '!drip') {

    const embed = new EmbedBuilder()
      .setTitle('🔥 FFH4X ANDROID - SEVEN CLIENT 🔥')
      .setDescription(`
🔥 **FFH4X ANDROID - SEVEN CLIENT**

🛡️ **SEGURO & FUNCIONAL**
✔ Compatível com Android 9 até Android 17  
📘 Tutorial completo incluso  
❌ Sem PC  
❌ Sem Shizuku  
❌ Sem alterar data  

⚡ **ENTREGA AUTOMÁTICA**
📩 Receba após a confirmação  
🔐 Mais seguro que FFH4X comum  
💸 Preço acessível  
📱 Direto no celular  

🔥 **FUNÇÕES**
✔ Back Jump  
✔ Spin Bot  
✔ Tatu  
✔ Anti Tatu  
✔ Aimkill  
✔ E muito mais  

💎 **BENEFÍCIOS**
✔ Comprar diamantes normalmente  
✔ App aparece como Play Store  
✔ Mais segurança  

━━━━━━━━━━━━━━━━━━━━━━
📦 **ESCOLHA SEU PLANO ABAIXO**
      `)
      .setImage('https://media.discordapp.net/attachments/1482528899903782932/1484254280088027216/file_000000008530720eb8922a615208f883.png')
      .setColor('#8A2BE2');

    const select = new StringSelectMenuBuilder()
      .setCustomId('drip_produto_gbz')
      .setPlaceholder('📦 Selecione a quantidade de dias')
      .addOptions([
        { label: '1 DIA', description: 'R$15,00', value: '15' },
        { label: '7 DIAS', description: 'R$40,00', value: '40' },
        { label: '15 DIAS', description: 'R$45,00', value: '45' },
        { label: '30 DIAS', description: 'R$60,00', value: '60' }
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }

});

// ================= INTERAÇÕES
client.on('interactionCreate', async (interaction) => {

  // ================= COMPRA
  if (interaction.isStringSelectMenu() && interaction.customId === 'drip_produto_gbz') {

    if (criando.has(interaction.user.id)) {
      return interaction.reply({
        content: '⏳ Aguarde...',
        ephemeral: true
      });
    }

    criando.add(interaction.user.id);

    const valor = interaction.values[0];

    const existente = interaction.guild.channels.cache.find(c =>
      c.name === `compra-${interaction.user.id}`
    );

    if (existente) {
      criando.delete(interaction.user.id);
      return interaction.reply({
        content: `❌ Você já possui um ticket: ${existente}`,
        ephemeral: true
      });
    }

    const canal = await interaction.guild.channels.create({
      name: `compra-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle('💰 PAGAMENTO VIA PIX')
      .setDescription(`
👤 **Cliente:** ${interaction.user}

💵 **Valor:** R$${valor}

📲 **Chave PIX:**
\`${PIX}\`

📌 Após pagar, aguarde o dono confirmar o pagamento.
      `)
      .setColor('#8A2BE2')
      .setThumbnail('https://media.discordapp.net/attachments/1482528899903782932/1484254280088027216/file_000000008530720eb8922a615208f883.png');

    const confirmar = new ButtonBuilder()
      .setCustomId('confirmar_pagamento')
      .setLabel('Confirmar Pagamento')
      .setStyle(ButtonStyle.Success);

    const fechar = new ButtonBuilder()
      .setCustomId('fechar_ticket')
      .setLabel('Fechar Ticket')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(confirmar, fechar);

    await canal.send({
      content: `${interaction.user}`,
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: `✅ Ticket criado: ${canal}`,
      ephemeral: true
    });

    setTimeout(() => {
      criando.delete(interaction.user.id);
    }, 5000);
  }

  // ================= CONFIRMAR (SÓ DONO)
  if (interaction.isButton() && interaction.customId === 'confirmar_pagamento') {

    if (interaction.user.id !== DONO_ID) {
      return interaction.reply({
        content: '❌ Apenas o dono pode confirmar!',
        ephemeral: true
      });
    }

    await interaction.channel.send(`
✅ **Pagamento confirmado!**

🔑 A key será enviada aqui pelo dono quando estiver online.
    `);

    interaction.reply({
      content: '✔️ Confirmado!',
      ephemeral: true
    });
  }

  // ================= FECHAR TICKET
  if (interaction.isButton() && interaction.customId === 'fechar_ticket') {

    await interaction.reply({
      content: '❌ Fechando ticket...',
      ephemeral: true
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 2000);
  }

});

client.login(process.env.TOKEN);
