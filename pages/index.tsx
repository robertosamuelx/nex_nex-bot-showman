import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'
import moment from 'moment'

interface Chat {
  user: String,
  name?: String
  messages: Message[]
}

interface Active {
  number: String,
  name: String
}

interface Message {
  date: Date,
  value: String,
  green: String,
  isFromMe: Boolean
}

export default function Home() {

  const [active, setActive] = useState<Active>({number: '', name: ''})
  const [myMessage, setMyMessage] = useState("")
  const [latest, setLatest] = useState<Chat[]>([])
  const [loading, setLoading] = useState("")
  const [contacts, setContacts] = useState([])

  async function getContacts(){
    const res = await fetch('http://localhost:5000/contacts')
    const json = await res.json()
    setContacts(json)
    return json
  }

  async function getChats() {
    const contacts_ = await getContacts()
    setLoading("Carregando mensagens...")
    fetch('http://localhost:3001/chats')
      .then(res => res.json())
      .then(json => {
        const result = json.map( el => {
          let name = ''
          contacts_.forEach( contact => {
            if(contact.number === el.user)
              name = contact.name
          })
          return {...el, name}
        })
        setLatest(result)
        setLoading("")
      })
  }

  useEffect(() => {
    getChats()
    let myInterval = setInterval(() => {
      getChats()
    }, 10000)
    
    return () => {
      clearInterval(myInterval)
    }
  }, [0])

  function sendMessage(e: KeyboardEvent, to: String, message: String) {

    if (e.key === 'Enter') {

      const data = {
        createdAt: new Date(),
        from: '5511991255932',
        to,
        body: message
      }

      fetch('http://localhost:3001/send', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(() => {
        getChats()
        setMyMessage('')
      })
    }
  }


  function ItemChat(chat: Chat) {
    const formattedMessages = chat.messages.map(message => {
      if (message.value.length > 15)
        return {
          ...message,
          value: message.value.substring(0, 15).concat('...')
        }
        else
          return message
    })
    return (
      <div className="item" onClick={e => {
        setActive({number: chat.user, name: chat.name})
      }}>
        <div className="title is-6">
          {chat.name}
        </div>
        <div className="subtitle is-6">
          {formattedMessages[formattedMessages.length - 1].value}
        </div>
      </div>
    )
  }

  function ItemMessage(message: Message) {
    const formattedDate = moment(message.date).format('LT')
    if (message.isFromMe) {
      return (
        <div className="mensagem-enviada">
          {message.value}
          <span>{formattedDate}</span>
        </div>
      )
    }
    else {
      return (
        <div className="mensagem-recebida">
          {message.value}
          <span>{formattedDate}</span>
        </div>
      );
    }
  }

  return (<div>
    <section className="section">
      <h3>{loading}</h3>
      <div className="container">
        <div className="columns">
          <div className="column is-3 lista-de-conversas">
            <div className="barra-superior"></div>
            {latest.map(i => <ItemChat key={i.user.toString()} user={i.user} messages={i.messages} name={i.name}/>)}
          </div>
          <div className="column conversa-ativa">
            <div className="barra-superior">
              <span>{active.name}</span>
            </div>
            <div className="lista-mensagens">
              <ul className="lista-mensagens-ul">
                {latest.map(chat => {
                  if (active.number === chat.user)
                    return chat.messages.map(message =>
                      <li>
                        <ItemMessage
                          date={message.date}
                          green={message.green}
                          value={message.value}
                          isFromMe={message.isFromMe} />
                        </li>
                    )
                })}
              </ul>
            </div>
            <div className="barra-inferior">
              <input type="text" className="input" placeholder="Insira a mensagem" onChange={e => {
                setMyMessage(e.target.value)
              }}
                onKeyPress={e => {
                  sendMessage(e, active.number, myMessage)
                }}
                value={myMessage} />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  )
}