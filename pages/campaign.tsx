import { GetServerSideProps } from "next"
import { signOut, getSession } from 'next-auth/client'
import { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import { FaUpload } from 'react-icons/fa'

interface Contact {
    name: string,
    number: string
}

interface Campaign {
    id: string,
    name: string,
    contacts: Contact[],
    createdAt: Date
}

export default function Campaign({ endpoint, session }) {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [searchedContact, setSearchedContact] = useState("")
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign>({ id: "", name: "", contacts: [], createdAt: null })
    const [newCampaign, setNewCampaign] = useState<Campaign>({ id: "", name: "", contacts: [], createdAt: null })
    const [show, setShow] = useState("")

    async function getContacts() {
        const res = await fetch(endpoint + '/contacts')
        const json = await res.json()
        setContacts(json)
    }

    async function getCampaigns() {
        const res = await fetch(endpoint + '/campaigns')
        const json = await res.json()
        setCampaigns(json)
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
                                        {campaigns.map((campaign, index) => <ItemCampaign campaign={campaign} key={campaign.id} index={index} />)}
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
                                        <p>Data de disparo: {selectedCampaign.createdAt ? moment(selectedCampaign.createdAt.toString()).format("DD/MM/YYYY") : ""}</p>
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
                                                    }} />
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label className="label">Lista de Contatos</label>
                                            <div className="control">
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
                                            <div className="control">
                                                
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