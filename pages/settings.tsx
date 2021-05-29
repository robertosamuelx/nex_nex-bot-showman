import { GetServerSideProps } from "next"
import { signOut, getSession } from 'next-auth/client'
import { useState, useEffect } from 'react'
import moment from 'moment'
import { useToasts } from 'react-toast-notifications'

interface User {
  username: String,
  name: String,
  password: String,
  createdAt: String,
  lastLogin: String,
  id: number
}
interface NewUser {
  username: String,
  name: String,
  password: String,
  confirmPassword: String
}

interface Ask {
  id: string,
  ask: string,
  answer: string,
  isOrder: boolean
}

export default function Settings({ endpoint, session }) {

  const [users, setUsers] = useState<User[]>([])
  const [asks, setAsks] = useState<Ask[]>([])
  const [selectedUser, setSelectedUser] = useState<User>({ id: 0, name: "", createdAt: '', lastLogin: '', password: '', username: '' })
  const [selectedAsk, setSelectedAsk] = useState<Ask>({ id: "", answer: "", ask: "", isOrder: false })
  const [show, setShow] = useState("")
  const [newUser, setNewUser] = useState<NewUser>({ name: "", password: '', username: '', confirmPassword: "" })
  const [newAsk, setNewAsk] = useState<Ask>({id: "", ask: "", answer: "", isOrder: false})

  const { addToast } = useToasts()

  async function getUsers() {
    const res = await fetch(endpoint + '/users')
    const json = await res.json()
    setUsers(json)
  }

  async function getAsks() {
    const res = await fetch(endpoint + '/ask')
    const json = await res.json()
    setAsks(json)
  }

  function createUser() {
    const data = JSON.stringify(newUser)
    fetch(endpoint + '/user', {
      method: "POST",
      body: data,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(() => {
      addToast("Usuário criado com sucesso!", { autoDismiss: true, appearance: "success" })
      handleCleanNewUser()
      getUsers()
    }).catch(err => {
      console.error(err)
      addToast("Ops, ocorreu um erro durante a criação, tente novamente mais tarde.", { autoDismiss: true, appearance: "error" })
    })
  }

  function createAsk(){
    const data = JSON.stringify(newAsk)
    fetch(endpoint + '/ask', {
      method: "POST",
      body: data,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(() => {
      addToast("Pergunta criada com sucesso!", { autoDismiss: true, appearance: "success" })
      handleCleanNewAsk()
      getAsks()
    }).catch(err => {
      console.error(err)
      addToast("Ops, ocorreu um erro durante a criação, tente novamente mais tarde.", { autoDismiss: true, appearance: "error" })
    })
  }

  function handleCleanNewUser() {
    setNewUser({ name: "", password: '', username: '', confirmPassword: "" })
  }

  function handleCleanNewAsk() {
    setNewAsk({id: "", ask: "", answer: "", isOrder: false})
  }

  function handleSubmitNewUser() {
    if (newUser.password !== newUser.confirmPassword)
      return addToast('As senhas não coincidem!', { autoDismiss: true, appearance: "error" })

    createUser()
  }

  function handleSubmitNewAsk(){
    const ids = asks.map(ask => ask.id)
    if(ids.includes(newAsk.id))
      return addToast(`A chave ${newAsk.id} já foi cadastrada, por favor escolha outra!`,  { autoDismiss: true, appearance: "error" })

    createAsk()
  }

  function handleDeleteUser() {
    fetch(endpoint + "/user/" + selectedUser.id, {
      method: "DELETE"
    })
      .then(() => {
        addToast("Usuário excluído com sucesso", { autoDismiss: true, appearance: "success" })
        getUsers()
        handleCleanNewUser()
        setShow("")
      })
      .catch(err => {
        addToast("Ops, ocorreu um erro, tente novamente mais tarde", { autoDismiss: true, appearance: "error" })
        console.log(err)
      })
  }

  function handleDeleteAsk(){
    fetch(endpoint + "/ask/" + selectedAsk.id, {
      method: "DELETE"
    }).then(() => {
      addToast("Pergunta excluída com sucesso", { autoDismiss: true, appearance: "success" })
      getAsks()
      handleCleanNewAsk()
      setShow("")
    }).catch(err => {
      addToast("Ops, ocorreu um erro, tente novamente mais tarde", { autoDismiss: true, appearance: "error" })
      console.log(err)
    })
  }

  function ListUsers(props: { user: User, index: number }) {
    return (<option value={props.index}>{props.user.username}</option>)
  }

  function ListAsks(props: { ask: Ask, index: number }) {
    return (<option value={props.index}>{props.ask.id}</option>)
  }

  function UserPanelDetails() {
    return (
      <div className="card-content">
        <div className="content">
          <p>Usuário: {selectedUser.username}</p>
          <p>Nome: {selectedUser.name}</p>
          <p>Criado em: {selectedUser.createdAt ? moment(selectedUser.createdAt.toString()).format("L") : ""}</p>
          <p>Último login: {selectedUser.lastLogin ? moment(selectedUser.lastLogin.toString()).format("L") : ""}</p>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <button
              className="button is-primary"
              onClick={() => alert("em desenvolvimento")}>Editar</button>
            <button
              className="button is-danger"
              onClick={() => handleDeleteUser()}>Excluir</button>
          </div>
        </div>
      </div>
    )
  }

  function AskPanelDetails() {
    return (
      <div className="card-content">
        <div className="content">
          <p>Pergunta: {selectedAsk.ask}</p>
          <p>Resposta: {selectedAsk.answer}</p>
          <p>Chave: {selectedAsk.id}</p>
          <label className="checkbox">
            <input type="checkbox" checked={selectedAsk.isOrder} />
            Essa pergunta está relacionada a um pedido
          </label>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <button
              className="button is-primary"
              onClick={() => alert("em desenvolvimento")}>Editar</button>
            <button
              className="button is-danger"
              onClick={() => handleDeleteAsk()}>Excluir</button>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    getUsers()
    getAsks()
  }, [])

  return (
    <section className="section">
      <div className="container">
        <div className="columns">
          <div className="column is-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-header-title title is-4">
                  Usuários
                                </h3>
              </div>
              <div className="card-content" style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="select is-info">
                  <select onChange={e => {
                    setSelectedUser(users[e.target.value])
                    setShow('user_details')
                  }}>
                    <option value={0}>Escolha</option>
                    {users.map((user, index) => <ListUsers user={user} index={index} key={user.id} />)}
                  </select>
                </div>
                <button
                  className="button"
                  onClick={() => {
                    setShow("user_create")
                  }}>Criar novo</button>
              </div>
              <footer className="card-footer"></footer>
            </div>
            <div className="card" >
              <div className="card-header">
                <h3 className="card-header-title title is-4">
                  Perguntas e Respostas
              </h3>
              </div>
              <div className="card-content" style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="select is-info">
                  <select onChange={e => {
                    setSelectedAsk(asks[e.target.value])
                    setShow('ask_details')
                  }}>
                    <option value={0}>Escolha</option>
                    {asks.map((ask, index) => <ListAsks ask={ask} index={index} key={ask.id} />)}
                  </select>
                </div>
                <button
                  className="button"
                  onClick={() => {
                    setShow("ask_create")
                  }}>Criar novo</button>
              </div>
            </div>
          </div>
          <div className="column">
            <div className="card">
              <div className="card-header">
                <h3 className="card-header-title title is-5">
                  Detalhes
                </h3>
                <button
                  className="button is-link"
                  style={{ margin: "5px" }}
                  onClick={() => {
                    signOut({ callbackUrl: '/' })
                  }}>Sair</button>
              </div>
              {show == "user_details" &&
                <UserPanelDetails />}
              {show == "user_create" &&
                <div className="card-content">
                  <div className="content">
                    <div className="field">
                      <label className="label">Nome</label>
                      <div className="control">
                        <input
                          className="input"
                          type="input"
                          placeholder="José da Silva"
                          value={newUser.name.toString()}
                          onChange={e => {
                            setNewUser({ ...newUser, name: e.target.value })
                          }} />
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Nome de usuário</label>
                      <div className="control">
                        <input className="input" type="input" placeholder="usuariodojose" value={newUser.username.toString()} onChange={
                          e => setNewUser({ ...newUser, username: e.target.value })
                        } />
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Senha</label>
                      <div className="control">
                        <input className="password" type="password" placeholder="senha do jose" value={newUser.password.toString()} onChange={
                          e => setNewUser({ ...newUser, password: e.target.value })
                        } />
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Confirme a senha</label>
                      <div className="control">
                        <input
                          className="password"
                          type="password"
                          placeholder="senha do jose"
                          value={newUser.confirmPassword.toString()}
                          onChange={e => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="field" style={{ display: "flex", justifyContent: "space-around" }}>
                      <div className="control">
                        <button
                          className="button is-success"
                          onClick={() => {
                            handleSubmitNewUser()
                          }}
                        >Salvar</button>
                      </div>
                      <div className="control">
                        <button
                          className="button is-info"
                          onClick={() => {
                            handleCleanNewUser()
                          }}>Limpar</button>
                      </div>
                    </div>
                  </div>
                </div>}
              {show == 'ask_details' &&
                <AskPanelDetails />}
              {show == 'ask_create' &&
                <div className="card-content">
                  <div className="content">
                    <div className="field">
                      <label className="label">Pergunta</label>
                      <div className="control">
                        <input
                          className="input"
                          type="input"
                          placeholder="10 - Qual horário de funcionamento ?"
                          required={true}
                          value={newAsk.ask}
                          onChange={e => {
                            setNewAsk({...newAsk, ask: e.target.value})
                          }}
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Resposta</label>
                      <div className="control">
                        <input
                          className="input"
                          type="input"
                          placeholder="De segunda á sexta, das 9 ás 18 horas"
                          required={true}
                          value={newAsk.answer}
                          onChange={e => {
                            setNewAsk({...newAsk, answer: e.target.value})
                          }}
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Chave</label>
                      <div className="control">
                        <input
                          className="input"
                          type="input"
                          placeholder="10"
                          required={true}
                          value={newAsk.id}
                          onChange={e => {
                            setNewAsk({...newAsk, id: e.target.value})
                          }}
                        />
                      </div>
                    </div>
                    <div className="field">
                      <div className="control">
                        <label className="checkbox">
                          <input type="checkbox" checked={newAsk.isOrder} onChange={e => {
                            setNewAsk({...newAsk, isOrder: e.target.checked})
                          }}/>
                            Essa pergunta está relacionada a um pedido
                        </label>
                      </div>
                    </div>
                    <div className="field" style={{ display: "flex", justifyContent: "space-around" }}>
                      <div className="control">
                        <button
                          className="button is-success"
                          onClick={() => {
                            handleSubmitNewAsk()
                          }}
                        >Salvar</button>
                      </div>
                      <div className="control">
                        <button
                          className="button is-info"
                          onClick={() => {
                            handleCleanNewAsk()
                          }}>Limpar</button>
                      </div>
                    </div>
                  </div>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const { res } = context

  if (!session) {
    return {
      redirect: {
        destination: '/'
      },
      props: {}
    }
  }

  return {
    props: {
      endpoint: process.env.ENDPOINT_MANAGER,
      session: session
    }
  }
}