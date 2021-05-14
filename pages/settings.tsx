import { GetServerSideProps } from "next"
import { signOut, getSession } from 'next-auth/client'
import { useState, useEffect } from 'react'
import moment from 'moment'

interface User {
  username: String,
  name: String,
  password: String,
  createdAt: String,
  lastLogin: String,
  id: number
}

export default function Settings({ endpoint, session }){

  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User>({id: 0, name: "", createdAt: '', lastLogin: '', password: '', username: ''})

  async function getUsers(){
    const res = await fetch(endpoint + '/users')
    const json = await res.json()
    setUsers(json)
  }

  function ListUsers(props: {user: User, index: number}){
    return (<option value={props.index}>{props.user.username}</option>)
  }

  useEffect(() => {
    getUsers()
  },[])

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
                            <div className="card-content">
                              <div className="select is-info">
                                <select value={selectedUser.id} onChange={e => {
                                  setSelectedUser(users[e.target.value])
                                }}>
                                  <option value={0}>Escolha</option>
                                  {users.map((user,index) => <ListUsers user={user} index={index} key={user.id}/>)}
                                </select>
                              </div>
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
                          <p>Usuário: {selectedUser.username}</p>
                          <p>Nome: {selectedUser.name}</p>
                          <p>Criado em: {selectedUser.createdAt}</p>
                          <p>Último login: {selectedUser.lastLogin}</p>
                        </div>
                    </div>
                </div>
            </div>
       </section>
    )
}

export const getServerSideProps : GetServerSideProps = async (context) => {
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