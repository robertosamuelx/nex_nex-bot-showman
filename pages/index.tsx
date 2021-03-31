import { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import { FaArrowDown, FaArrowUp, FaArrowCircleDown } from 'react-icons/fa'
import { IoMdSend } from 'react-icons/io'
import { useToasts } from 'react-toast-notifications'
import { GetStaticProps } from 'next'
import { CgCloseR } from 'react-icons/cg'

interface Chat {
  id: Number,
  user: String,
  name?: String,
  status: String,
  salesman: String,
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

interface Categorie {
  value: String,
  options: Array<String>
}

interface Filter {
  field: String[],
  value: String[]
}

export default function Home({ endpoint }) {

  const [active, setActive] = useState<Active>({ number: '', name: '' })
  const [myMessage, setMyMessage] = useState("")
  const [latest, setLatest] = useState<Chat[]>([])
  const [contacts, setContacts] = useState([])
  const [botCache, setBotCache] = useState([])
  const [sales, setSales] = useState([])
  const { addToast } = useToasts()
  const [editName, setEditName] = useState(true)
  const [buttonText, setButtonText] = useState('Editar Nome')
  const [sallesmanName, setSallesmanName] = useState('...')
  const [showInputNameSallesman, setShowInputNameSallesman] = useState('none')
  const [categories, setCategories] = useState<Categorie[]>([])
  const [mustShowOptions, setMustShowOptions] = useState([])
  const [filter, setFilter] = useState<Filter>({ field: [], value: [] })
  const [notRead, setNotRead] = useState(0)
  const scrollRef = useRef(null)

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  async function getCategories() {
    const res = await fetch(endpoint + '/categories')
    const json = await res.json()
    setCategories(json)
  }

  async function getContacts() {
    const res = await fetch(endpoint + '/contacts')
    const json = await res.json()
    setContacts(json)
    return json
  }

  async function getBotCache() {
    const res = await fetch(endpoint + '/cached')
    const json = await res.json()
    setBotCache(json)
    return json
  }

  async function getSales() {
    const res = await fetch(endpoint + '/sales')
    const json = await res.json()
    setSales(json)
    return json
  }

  async function getChats() {
    await getCategories()
    const contacts_ = await getContacts()
    const cached = await getBotCache()
    const sales = await getSales()
    fetch(endpoint + '/chats',
      {
        body: JSON.stringify(filter),
        method: 'POST'
      }
    )
      .then(res => res.json())
      .then(json => {
        const result = json.map(el => {

          if (filter.field.includes('vendedor')) {

          }

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

  function sendMessage(to: String, message: String) {

    const data = {
      createdAt: new Date(),
      from: '5511991255932',
      to,
      body: message,
      salesman: sallesmanName
    }

    fetch(endpoint + '/send', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(() => {
      setMyMessage('')
      getChats()
      addToast('Mensagem enviada', { autoDismiss: true, appearance: 'info' })
    })
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
      <div className="item" style={
        {
          backgroundColor: chat.status == 'WAITING' ? '#98FB98' : chat.status == 'ON BOT' ? '#B0C4DE' : '#fff',
          border: chat.user == active.number ? '2px #f0f0f0 solid' : 'none'
        }
      } onClick={e => {
        setActive({ number: chat.user, name: chat.name })
      }}>
        <div className="title is-6">
          {chat.name}
        </div>
        <div className="subtitle is-6">
          {formattedMessages[formattedMessages.length - 1].value}
          {chat.salesman}
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

  function OptionItemCategorie(props: { categorie: Categorie }) {
    const { categorie } = props
    return (
      <ul>
        {mustShowOptions.includes(categorie.value) ?
          categorie.options.map(option => <li className="categorie-item-option" onClick={() => {

          }}>{option}</li>) :
          <div />}
      </ul>
    )
  }

  function ItemCategorie(props: { categorie: Categorie }) {
    const { categorie } = props
    return (
      <div
        className="categorie"
        onClick={() => {
          if (!mustShowOptions.includes(categorie.value))
            mustShowOptions.push(categorie.value)
          else
            mustShowOptions.splice(mustShowOptions.indexOf(categorie.value), 1)
          setMustShowOptions(mustShowOptions)
          getChats()
        }}>
        <div className="categorie-item">
          {categorie.value}

          {categorie.options.length > 0 &&
            <div>
              <FaArrowDown style={{ display: mustShowOptions.includes(categorie.value) ? "none" : "block" }} />
              <FaArrowUp style={{ display: mustShowOptions.includes(categorie.value) ? "block" : "none" }} />
            </div>
          }
        </div>
        <OptionItemCategorie categorie={categorie} />
      </div>
    )
  }


  return (<div>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <button className="button is-primary" onClick={() => {
        fetch(endpoint + '/start')
          .then(() => { addToast('Bot ligado!', { appearance: 'success', autoDismiss: true }) })
      }}>Ligar bot</button>
      <input type="text" className="input" value={sallesmanName} onChange={e => {
        setSallesmanName(e.target.value)
      }} style={{ width: '50%', display: showInputNameSallesman }} readOnly={editName} />
      <h3 className="title" style={{ display: showInputNameSallesman === 'block' ? 'none' : 'block' }}>Bem-vindo(a) {sallesmanName}</h3>
      <button className="button is-link" onClick={() => {
        setEditName(!editName)
        if (buttonText === 'Salvar') {
          addToast('Nome do vendedor definido para '.concat(sallesmanName), { appearance: 'success', autoDismiss: true })
          setShowInputNameSallesman('none')
        }
        else
          setShowInputNameSallesman('block')
        setButtonText(buttonText === 'Salvar' ? 'Editar Nome' : 'Salvar')
      }}>{buttonText}</button>
    </div>
    <section className="section">
      <div className="container">
        <div className="columns">
          <div className="column is-2 lista-de-categorias">
            <div className="barra-superior">
              <span>Categorias</span>
            </div>
            <div className="categories">
              {categories.map(categorie => <ItemCategorie categorie={categorie} key={categorie.value.toString()} />)}
            </div>
          </div>
          <div className="column is-3 lista-de-conversas">
            <div className="barra-superior">
              <span>Conversas</span>
              <span>{notRead > 1 ? notRead + ' não lidas' : notRead + ' não lida '}</span>
            </div>
            {latest.map(i => <ItemChat key={i.id.valueOf()} chat={i} />)}
          </div>
          <div className="column conversa-ativa">
            <div className="barra-superior">
              <span>{active.name}</span>
              <button className="button"
                style={{ background: 'none', border: 'none', marginLeft: '10px' }}
                onClick={() => {
                  alert('Funçao de encerrar atendimento em desenvolvimento')
                }}
              >
                <CgCloseR />
              </button>
            </div>
            <div className="lista-mensagens">
              <ul className="lista-mensagens-ul" >
                {latest.map(chat => {
                  if (active.number === chat.user)
                    return chat.messages.map(message =>
                      <li ref={scrollRef}>
                        <ItemMessage
                          message={message} />
                      </li>
                    )
                })}
              </ul>

            </div>
            <div className="barra-inferior">
              <button className="arrow-container">
                <FaArrowCircleDown size={40} className="arrow" onClick={() => { scrollToBottom() }} />
              </button>
              <textarea placeholder="Insira a mensagem" onChange={e => {
                setMyMessage(e.target.value)
              }}
                value={myMessage} />
              <button
                style={{ background: 'none', border: 'none' }}
                className="button"
                onClick={() => {
                  if (myMessage !== '')
                    sendMessage(active.number, myMessage)
                  else
                    addToast('Mensagem inválida!', { autoDismiss: true, appearance: "error" })
                }}
              >
                <IoMdSend size={40} />
              </button>

            </div>
          </div>
        </div>
      </div>
    </section>
  </div>)
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      'endpoint': process.env.ENDPOINT_MANAGER
    }
  }
}