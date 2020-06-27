import { ChatUserstate, Client } from 'tmi.js'

type CommandArguments = {
    userState: ChatUserstate,
    command: string,
    message: string | null
    channel: string
}

type CommandResponse = {
    success: boolean
}

type Message = {
    message: string
    username: string
    userId: string
}

const handleMessage = (message: Message) => {
    console.log('\x1b[30m\x1b[43m%s\x1b[0m', JSON.stringify(message))
}

const hello = (client: Client, { userState, channel }: CommandArguments) => {
    const response = `Hello to you too, ${userState.username} we're hot reloading now. It's the future!`
    client.say(channel, response)
}

const showAndTell = (client: Client, { userState, channel, message }: CommandArguments): CommandResponse => {
    let response: string
    let success: boolean
    if (message && userState["user-id"] && userState.username) {
        handleMessage({ message, userId: userState["user-id"], username: userState.username })
        response = `Thank you ${userState["display-name"]}! Your show and tell idea has been received.`
        success = true
    } else {
        response = 'Sorry, there was an issue with your request. Please suply a message along with your command.'
        success = false
    }
    client.say(channel, response)
    return {
        success
    }
}

const officeHours = (client: Client, { userState, channel, message }: CommandArguments): CommandResponse => {
    let response: string
    let success: boolean

    if (message && userState["user-id"] && userState.username) {
        handleMessage({ message, userId: userState["user-id"], username: userState.username })
        response = `Thank you ${userState["display-name"]}! Your office hours request has been received.`
        success = true
    } else {
        response = 'Sorry, there was an issue with your request. Please suply a message along with your command.'
        success = false
    }
    client.say(channel, response)
    return {
        success
    }
}

export {
    hello,
    showAndTell,
    officeHours
}