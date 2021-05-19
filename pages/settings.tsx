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

export default function Settings({ endpoint, session }) {

  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User>({ id: 0, name: "", createdAt: '', lastLogin: '', password: '', username: '' })
  const [show, setShow] = useState("")
  const [newUser, setNewUser] = useState<NewUser>({ name: "", password: '', username: '', confirmPassword: "" })
  const [newUserName, setNewUserName] = useState("")
  const { addToast } = useToasts()

  async function getUsers() {
    const res = await fetch(endpoint + '/users')
    const json = await res.json()
    setUsers(json)
  }

  async function createUser() {
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
    }).catch(err => {
      console.error(err)
      addToast("Ops, ocorreu um erro durante a criação, tente novamente mais tarde.",{ autoDismiss: true, appearance: "error" })
    })
  }

  function handleCleanNewUser(){
    setNewUser({ name: "", password: '', username: '', confirmPassword: "" })
  }

  function handleSubmitNewUser() {
    if(newUser.password !== newUser.confirmPassword)
      return addToast('As senhas não coincidem!', { autoDismiss: true, appearance: "error" })
    
    createUser()
  }

  function handleDeleteUser(){
    //add modal to confirm delete
  }

  function ListUsers(props: { user: User, index: number }) {
    return (<option value={props.index}>{props.user.username}</option>)
  }

  function PanelDetails() {
    return (
      <div className="card-content">
        <div className="content">
          <p>Usuário: {selectedUser.username}</p>
          <p>Nome: {selectedUser.name}</p>
          <p>Criado em: {selectedUser.createdAt ? moment(selectedUser.createdAt.toString()).format("L") : ""}</p>
          <p>Último login: {selectedUser.lastLogin ? moment(selectedUser.lastLogin.toString()).format("L") : ""}</p>
          <div style={{display: "flex", justifyContent: "space-around"}}>
          <button
            className="button is-primary"
            onClick={() => alert("em desenvolvimento")}>Editar</button>
          <button
            className="button is-danger"
            onClick={() => alert("em desenvolvimento")}>Excluir</button>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    getUsers()
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
                  <select value={selectedUser.id} onChange={e => {
                    setSelectedUser(users[e.target.value])
                    setShow('details')
                  }}>
                    <option value={0}>Escolha</option>
                    {users.map((user, index) => <ListUsers user={user} index={index} key={user.id} />)}
                  </select>
                </div>
                <button
                  className="button"
                  onClick={() => {
                    setShow("create")
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
              </div>
              {show == "details" &&
                <PanelDetails />}
              {show == "create" &&
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
                          setNewUser({...newUser, name: e.target.value})
                        }} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Nome de usuário</label>
                    <div className="control">
                      <input className="input" type="input" placeholder="usuariodojose" value={newUser.username.toString()} onChange={
                        e => setNewUser({...newUser, username: e.target.value})
                      }/>
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Senha</label>
                    <div className="control">
                      <input className="password" type="password" placeholder="senha do jose" value={newUser.password.toString()} onChange={
                        e => setNewUser({...newUser, password: e.target.value})
                      }/>
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
                        onChange={e => setNewUser({...newUser, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="field" style={{display: "flex", justifyContent: "space-around"}}>
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