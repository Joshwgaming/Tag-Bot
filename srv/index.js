const { Client, Intents, MessageEmbed, MessageContextMenuInteraction } = require('discord.js');
const mongoose = require('mongoose')
const newTagSchema = require('./schemas/tagSchema.js');
const tagCountSchema = require('./schemas/tagCountSchema.js');
const { botToken, mongoPath, prefix, modRoleID } = require('./config.json');
const client = new Client({
    partials: [
        "CHANNEL", "MESSAGE",
    ],
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});

client.login(botToken);


client.on('ready', async () =>{
    console.log(`Logged in as ${client.user.tag}.`);

    await mongoose.connect(mongoPath, 
        {
        keepAlive: true,
        }).then(console.log('Successfully connected to mongodb.'))
})

client.on('messageCreate', async (message) =>{

    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
    if (message.content.startsWith(prefix)) {
    if (message.author.id === client.user.id) return; //Ignores anything said by the bot.
    if (command === "help") { 
        message.reply(`${client.user.username} Commands:\n**${prefix}create** - Create a tag!\n**${prefix}delete** - Delete a tag!\n**${prefix}tagName** - View a tag!\n**${prefix}list-tags** - List your tags!\n\n\n*Please note, for ${prefix}create, the tag description has to be contained by "".*`)
    } else if (command === 'create') {
        const newArgs = message.content.trim().split(/ +/g);
        // Defining the tag name...
        let tagName = [];
        console.log(newArgs)
        if (newArgs[2].startsWith('"')) {
            message.reply('Invalid format. Please use the following format: `?tag create tagName "tagDescription" "#Optional Tag Colour Hex Code"`')
            return;
        }
        for (let i = 1; i < newArgs.length; i++) {
            if (newArgs[i].startsWith('"')) break;
            else tagName.push(newArgs[i]);
        }
        tagName = tagName.slice(1).join(' ');

        const choices = [];
            
        const regex = /(["'])((?:\\\1|\1\1|(?!\1).)*)\1/g;
        let match;
        while (match = regex.exec(args.join(' '))) choices.push(match[2]);
        let tagContent = choices[0]
        let tagColour = '#000000';
        if (choices.length === 2) {
            if (choices[1].startsWith('#'))
            tagColour = choices[1]
        } else if (choices.length <= 0) {
            message.reply('Error. Please use the following format: `?tag create tagName "tagDescription" "#Optional Tag Colour Hex Code"`')
            return;
        }

        const currentTagCount = await tagCountSchema.findOne({ _id: message.author.id})

        if (currentTagCount === null){
            const tagExistCheck = await newTagSchema.findOne({ tagName: tagName})
            if (tagExistCheck === null) { 
                await newTagSchema.create({
                    tagAuthor: message.author.id,
                    tagName: tagName,
                    tagColour: tagColour,
                    tagDesciption: tagContent,
                })
                await tagCountSchema.create({
                    _id: message.author.id,
                    tagCount: '1'
                });
                message.reply('Tag successfully created!')
            } else if (tagExistCheck.tagName === tagName) {
                message.reply('Sorry, this tag name is already in use! Please try another name.')
            } else {
                console.log("erorr")
            }
        } else if (currentTagCount.tagCount <= '9') {
            const tagExistCheck = await newTagSchema.findOne({ tagName: tagName})
            if (tagExistCheck === null) { 
                await newTagSchema.create({
                    tagAuthor: message.author.id,
                    tagName: tagName,
                    tagColour: tagColour,
                    tagDesciption: tagContent,
                })
                await tagCountSchema.findOneAndUpdate({
                    _id: message.author.id,
                }, {
                    $inc: { //incriment
                        'tagCount': 1
                    },
                })
                message.reply('Tag successfully created!')
            } else if (tagExistCheck.tagName === tagName) {
                message.reply('Sorry, this tag name is already in use! Please try another name.')
            } else {
                console.log("erorr")
            }
        } else if (currentTagCount.tagCount === '10') {
            const tagExistCheck = await newTagSchema.findOne({ tagName: tagName})
            if (tagExistCheck === null) { 
                await newTagSchema.create({
                    tagAuthor: message.author.id,
                    tagName: tagName,
                    tagColour: tagColour,
                    tagDesciption: tagContent,
                })
                await tagCountSchema.findOneAndUpdate({
                    _id: message.author.id,
                }, {
                    $inc: { //incriment
                        'tagCount': 1
                    },
                })
                message.reply('Tag successfully created!')
            } else if (tagExistCheck.tagName === tagName) {
                message.reply('Sorry, this tag name is already in use! Please try another name.')
            } else {
                console.log("erorr")
            }
        } else {
            message.reply("Sorry, you can only have 10 tags! To add more, delete an existing tag!")
        }
    } else if (command === 'delete') {
        const searchForTag = await newTagSchema.findOne({ tagName: args[0]})
        console.log(searchForTag)
        if (searchForTag === null) {
            message.reply("That tag doesn't exist!");
        } else if (searchForTag.tagAuthor === message.author.id) { 
            await newTagSchema.findOneAndDelete({ tagName: args[0]})
            await tagCountSchema.findOneAndUpdate({
                _id: message.author.id,
            }, {
                $inc: { //incriment
                    'tagCount': -1
                },
            })
            message.reply('Successfully deleted tag!');
        } else if (message.member.roles.cache.find(r => r.id === modRoleID)){
            await newTagSchema.findOneAndDelete({ tagName: args[0]})
            await tagCountSchema.findOneAndUpdate({
                _id: searchForTag.tagAuthor
            }, {
                $inc: { //incriment
                    'tagCount': -1
                },
            })
            message.reply('Successfully deleted tag!')
        } else {
            message.reply("Sorry, you can only delete tags you have created!")
        }
    } else if (command === 'list-tags') {
        const searchForTag = await newTagSchema.find({ tagAuthor: message.author.id})
        if (searchForTag.length === 0) {
            message.reply("You currently have no tags, why not create one using `?tag create`!")
        } else {
            let reply = `Current tags for <@${message.author.id}>:\n\nTag Name - Tag Description\n`
            let i = 0;
            for (const result of searchForTag) {

                const { tagName, tagDesciption } = searchForTag[i];
                i++;
                reply += `${tagName} - ${tagDesciption}\n`;
            };
            message.reply(reply)
        }
    } else {
        if (command.length === 0) {
            message.reply(`Use ${prefix}help to find the bot's commands!`)
        } else {
            const searchForTag = await newTagSchema.findOne({ tagName: command})
            if (searchForTag === null) {
                message.reply("Sorry, that tag doesn not exist.")
            } else {
                const tagEmbed = new MessageEmbed()
                    .setColor(searchForTag.tagColour)
                    .setDescription(searchForTag.tagDesciption)
                message.channel.send({ embeds: [tagEmbed] })
            }
        }   
    }
}
})
