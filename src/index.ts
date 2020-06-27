import tmi, { ChatUserstate } from 'tmi.js'
import ejs from 'ejs'
import fs from 'fs'

import config from './config'
import { sanitizeInput } from './utilities'
import * as commands from './commands'

let officeHoursRequests = 0
let showAndTellRequests = 0

const VALID_COMMANDS = ['!hello', '!showandtell', '!officehours'] as const
type ValidCommands = typeof VALID_COMMANDS[number]

const client = tmi.Client(config)

const onMessageHandler = (channel: string, userState: ChatUserstate, rawInput: string, self: boolean) => {
    if (self) {
        return
    }

    const { command, message } = sanitizeInput(rawInput)

    if (command === null || command in VALID_COMMANDS) {
        return null
    }

    const commandArguments = { userState, command, message, channel }
    let response
    switch (command as ValidCommands) {
        case '!hello':
            commands.hello(client, commandArguments)
            break
        case '!showandtell':
            response = commands.showAndTell(client, commandArguments)
            if (response.success) {
                showAndTellRequests += 1
            }
            break
        case '!officehours':
            response = commands.officeHours(client, commandArguments)
            if (response.success) {
                officeHoursRequests += 1
            }
            break
    }
}

const advertise = () => {
    const now = new Date()
    if (now.getMinutes() === 30) {
        client.say(
            config.channels[0],
            "Need help on a project? Type \"!officehours your message\" to get help live!"
        )
    } else if (now.getMinutes() === 0) {
        client.say(
            config.channels[0],
            "Have a project to share? Type \"!showandtell your project\" to share it live!"
        )
    }
}

const renderHTMLOverlay = () => {
    const template = fs.readFileSync('./src/index.template.ejs', 'utf-8')
    let html = ejs.render(template, { officeHoursRequests, showAndTellRequests });
    fs.writeFileSync('./dist/index.html', html, 'utf8')
}

const intervalIds = new Set<NodeJS.Timeout>()

const onConnectedHandler = (address: string, port: number) => {
    console.log(`* Connected to ${address}: ${port} `);

    intervalIds.forEach(clearInterval)
    intervalIds.clear()

    const advertiseInterval = setInterval(advertise, 1000 * 60)
    intervalIds.add(advertiseInterval)

    const renderHTMLOverlayInterval = setInterval(renderHTMLOverlay, 1000)
    intervalIds.add(renderHTMLOverlayInterval)

}

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.connect();

