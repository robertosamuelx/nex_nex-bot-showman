import { GetServerSideProps } from "next"
import { signOut, getSession } from 'next-auth/client'
import { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import { FaUpload, FaSearch, FaTrash } from 'react-icons/fa'
import { useToasts } from 'react-toast-notifications'
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker"
import pt_br from 'date-fns/locale/pt-BR'
registerLocale('pt_br', pt_br)

interface Contact {
    name: string,
    number: string
}

interface Campaign {
    name: string,
    contacts: Contact[],
    createdAt: Date,
    message: string,
    sendAt: Date
}

export default function Campaign({ endpoint, session }) {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [searchedContact, setSearchedContact] = useState("")
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign>({name: "", contacts: [], createdAt: null, message: "", sendAt: null  })
    const [newCampaign, setNewCampaign] = useState<Campaign>({name: "", contacts: [], createdAt: null, message: "", sendAt: null })
    const [auxSendAtNewCampaign, setAuxSendAtNewCampaign] = useState("")
    const [show, setShow] = useState("")
    const { addToast } = useToasts()

    async function getContacts() {
        const res = await fetch(endpoint + '/contacts', {
            headers: {
                "filter": searchedContact
            }
        })
        const json = await res.json()
        setContacts(json)
    }

    async function getCampaigns() {
        const res = await fetch(endpoint + '/campaigns')
        const json = await res.json()
        setCampaigns(json)
    }

    function createCampaign() {
        const data = JSON.stringify(newCampaign)
        console.log(data)
        fetch(endpoint + '/campaign', {
            method: "POST",
            body: data,
            headers: {
                'Content-Type': 'application/json'
              }
        }).then(() => {
            addToast("Campanha criada com sucesso!", {autoDismiss: true, appearance: "success"})
            getCampaigns()
        }).catch( err => {
            addToast("Ops, ocorreu um erro durante a criação, tente novamente mais tarde.", { autoDismiss: true, appearance: "error" })
            console.error(err)
        })
    }

    function addContact(contact: Contact){
        if(!newCampaign.contacts.includes(contact))
            setNewCampaign({...newCampaign, contacts: [...newCampaign.contacts, contact]})
    }

    function delContact(contact: Contact){
        if(newCampaign.contacts.includes(contact))
            setNewCampaign({...newCampaign, contacts: newCampaign.contacts.filter(contact_ => contact.number !== contact_.number)})
    }

    useEffect(() => {
        //getContacts()
        getCampaigns()
    }, [])

    function ItemCampaign(props: { campaign: Campaign, index: number }) {
        return (<option value={props.index}>{props.campaign.name}</option>)
    }

    return (
        <section className="section">
            <div className="container">
                <div className="columns">
                    <div className="column is-4">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-header-title title is-5">
                                    Campanhas
                                </h3>
                            </div>
                            <div className="card-content" style={{ display: "flex", justifyContent: "space-between" }}>
                                <div className="select is-info">
                                    <select onChange={e => {
                                        setSelectedCampaign(campaigns[e.target.value])
                                        setShow("camp_details")
                                    }}>
                                        <option value={0}>Escolha</option>
                                        {campaigns.map((campaign, index) => <ItemCampaign campaign={campaign} key={campaign.name} index={index} />)}
                                    </select>
                                </div>
                                <button
                                    className="button is-info"
                                    onClick={() => {
                                        setShow("camp_create")
                                    }}>Criar nova</button>
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
                            {show == "camp_details" &&
                                <div className="card-content">
                                    <div className="content">
                                        <p>Nome: {selectedCampaign.name}</p>
                                        <p>Data de disparo: {selectedCampaign.sendAt ? moment(selectedCampaign.sendAt.toString()).format("DD/MM/YYYY") : ""}</p>
                                        <p>Mensagem: {selectedCampaign.message}</p>
                                        <p>Contatos impactados: <strong>{selectedCampaign.contacts.length}</strong></p>
                                        <ul style={{ listStyle: "none" }}>
                                            {selectedCampaign.contacts.map(contact => <li key={contact.number}>{contact.name}</li>)}
                                        </ul>
                                    </div>
                                </div>}
                            {show == "camp_create" &&
                                <div className="card-content">
                                    <div className="content">
                                        <div className="field">
                                            <label className="label">Nome</label>
                                            <div className="control">
                                                <input
                                                    className="input"
                                                    type="input"
                                                    placeholder="Promoção do próximo sábado!"
                                                    value={newCampaign.name.toString()}
                                                    onChange={e => {
                                                        setNewCampaign({ ...newCampaign, name: e.target.value })
                                                    }}
                                                    required={true}/>
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label className="label">Data e hora</label>
                                            <div className="control">
                                                <DatePicker
                                                    selected={newCampaign.sendAt}
                                                    onChange={date => setNewCampaign({...newCampaign, sendAt: date})}
                                                    dateFormat="dd/MM/yyyy"
                                                    locale="pt_br"/>
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label className="label">Mensagem</label>
                                            <div className="control">
                                                <textarea
                                                    className="textarea"
                                                    rows={5}
                                                    required={true}
                                                    placeholder="Promoção imperdível!"
                                                    value={newCampaign.message}
                                                    onChange={e => setNewCampaign({...newCampaign, message: e.target.value})}/>
                                            </div>
                                        </div>
                                        <div className="field" style={{ display: "flex", justifyContent: "center", marginBottom: "5%" }}>
                                            <label className="label">Lista de Contatos</label>
                                        </div>
                                        <div className="columns">
                                            {/* <div className="column">
                                                <div className="file">
                                                    <label className="file-label">
                                                        <input className="file-input" type="file" name="base" />
                                                        <span className="file-cta">
                                                            <span className="file-icon">
                                                                <FaUpload />
                                                            </span>
                                                            <span className="file-label">Escolha um arquivo...</span>
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="column">
                                                <p>ou</p>
                                            </div> */}
                                            <div className="column">
                                                <div className="columns">
                                                    <div className="column">
                                                        <input
                                                            className="input"
                                                            placeholder="José da Silva"
                                                            onChange={e => setSearchedContact(e.target.value)}
                                                            value={searchedContact} />
                                                        <div className="content">
                                                            <ul style={{ listStyle: "none" }}>
                                                                {contacts.map(contact => {
                                                                    return <li key={contact.number}>
                                                                        <button
                                                                            className="button is-white"
                                                                            onClick={() => { addContact(contact)}}>
                                                                            {contact.name}
                                                                        </button>
                                                                    </li>
                                                                })}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="column is-2">
                                                        <FaSearch
                                                            size={25}
                                                            onClick={() => {
                                                                if(searchedContact !== "")
                                                                    getContacts()
                                                                else
                                                                    setContacts([])
                                                            }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="column">
                                                <div className="box">
                                                    {newCampaign.contacts.map(contact => {
                                                    return <div className="card" style={{border: "1px dotted"}}>
                                                        <div className="card-header">
                                                            <p className="card-header-title">{contact.name}</p>
                                                        </div>
                                                        <div className="card-content" style={{display: "flex", justifyContent: "space-between"}}>
                                                            <p>{contact.number}</p>
                                                            <span><FaTrash onClick={() => delContact(contact)}/></span>
                                                        </div>
                                                    </div>})}
                                                    <div style={{display:"flex", justifyContent: "space-around", alignItems: "center"}}>
                                                        <button className="button is-primary" onClick={() => createCampaign()}>Salvar</button>
                                                        <button className="button is-warning" onClick={() => {
                                                            setNewCampaign({...newCampaign, contacts: []})
                                                        }}>Limpar</button>
                                                    </div>
                                                </div>
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