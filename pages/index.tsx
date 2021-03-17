import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'
import moment from 'moment'
import { FaRobot } from 'react-icons/fa'
import { IoPersonSharp } from 'react-icons/io5'
import { VscLoading, VscFilter } from 'react-icons/vsc'
import { useToasts } from 'react-toast-notifications'

const controlIcons = {
  status: ['ON BOT', 'WAITING', 'ON ATTENDANT'],
  icons: [<FaRobot />, <VscLoading />, <IoPersonSharp />]
}

interface Chat {
  user: String,
  name?: String,
  status: String,
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

  const [active, setActive] = useState<Active>({ number: '', name: '' })
  const [myMessage, setMyMessage] = useState("")
  const [latest, setLatest] = useState<Chat[]>([])
  const [contacts, setContacts] = useState([])
  const [botCache, setBotCache] = useState([])
  const { addToast } = useToasts()

  async function getContacts() {
    const res = await fetch('http://localhost:5000/contacts')
    const json = await res.json()
    setContacts(json)
    return json
  }

  async function getBotCache() {
    const res = await fetch('http://localhost:3001/cached')
    const json = await res.json()
    setBotCache(json)
    return json
  }

  async function getChats() {
    const contacts_ = await getContacts()
    const cached = await getBotCache()
    fetch('http://localhost:3001/chats')
      .then(res => res.json())
      .then(json => {
        const result = json.map(el => {
          let name = ''
          let status = 'ON ATTENDANT'

          contacts_.forEach(contact => {
            if (contact.number === el.user)
              name = contact.name
          })

          cached.forEach(cache => {
            if (cache.user === el.user) {
              status = 'ON BOT'

              if (!cache.shouldRespond) {
                status = 'WAITING'
              }

            }
          })
          return { ...el, name, status }
        })
        setLatest(result)
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


  function ItemChat(props: { chat: Chat }) {
    const { chat } = props
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
        setActive({ number: chat.user, name: chat.name })
      }}>
        <div className="title is-6">
          {chat.name}
        </div>
        <div className="subtitle is-6">
          {formattedMessages[formattedMessages.length - 1].value}
          {controlIcons.icons[controlIcons.status.indexOf(chat.status.toString())]}
        </div>
      </div>
    )
  }

  function ItemMessage(props: { message: Message }) {
    const { message } = props
    const formattedValue = message.value.split("\n")
    const formattedDate = moment(message.date).format('LT')
    const className = message.isFromMe ? "mensagem-enviada" : "mensagem-recebida"
    return (
      <div className={className}>
        {formattedValue.map(value => value !== '' ? <p>{value}</p> : <br />)}
        <span>{formattedDate}</span>
      </div>
    )
  }

  return (<div>
    <section className="section">
      <div className="container">
        <div className="columns">
          <div className="column is-3 lista-de-conversas">
            <div className="barra-superior">
              <span>
                Categorizar por: <VscFilter />
              </span>
            </div>
            {latest.map(i => <ItemChat key={i.user.toString()} chat={i} />)}
          </div>
          <div className="column conversa-ativa">
            <div className="barra-superior">
              <span>{active.name}</span>
            </div>
            <div className="lista-mensagens">
              <ul className="lista-mensagens-ul" >
                {latest.map(chat => {
                  if (active.number === chat.user)
                    return chat.messages.map(message =>
                      <li>
                        <ItemMessage
                          message={message} />
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