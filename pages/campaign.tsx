import { GetServerSideProps } from "next"
import { signOut, getSession } from 'next-auth/client'
import { useState, useEffect, useRef } from 'react'
import { BsSearch } from 'react-icons/bs'

interface Contact {
    name: string,
    number: string
}

export default function Campaign({ endpoint, session }) {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [searchedContact, setSearchedContact] = useState("")
    const scrollRef = useRef(null)

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
      }

    async function getContacts(){
        const res = await fetch(endpoint + '/contacts')
        const json = await res.json()
        setContacts(json)
    }

    useEffect(() => {
        getContacts()
    },[])

    function ItemContact(props: { contact:Contact, index: number }){
        return (<p ref={scrollRef}>{props.contact.name}</p>)
    }

    return (
        <section className="section">
            <div className="container">
                <div className="columns">
                    <div className="column">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-header-title title is-5">
                                    Contatos
                                </h3>
                            </div>
                            <div className="card-content">
                                <div style={{display: "flex", justifyContent: "space-around", margin: "5px", alignItems: "center"}}>
                                    <input className="input" value={searchedContact} onChange={e => {setSearchedContact(e.target.value)}}/>
                                    <BsSearch size={25} onClick={() => {
                                        setContacts(contacts.filter(contact => contact.name.toLowerCase().includes(searchedContact.toLocaleLowerCase())))
                                    }}/>
                                </div>
                                <div className="content" style={{maxHeight: "500px", overflowX: "hidden", overflowY: "scroll"}}>
                                    {contacts.map((contact, index) => <ItemContact contact={contact} key={contact.number} index={index}/>)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="column">
                        <button
                            className="button is-link"
                            style={{ margin: "5px" }}
                            onClick={() => {
                                signOut({ callbackUrl: '/' })
                            }}>Sair</button>
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