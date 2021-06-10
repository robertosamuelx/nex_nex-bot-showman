import { GetServerSideProps } from "next"
import { signOut, getSession } from 'next-auth/client'
import { useState, useEffect, useRef } from 'react'
import moment from 'moment'

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
                                    }}>
                                        <option value={0}>Escolha</option>
                                        {campaigns.map((campaign, index) => <ItemCampaign campaign={campaign} key={campaign.id} index={index} />)}
                                    </select>
                                </div>
                                <button
                                    className="button is-info"
                                    onClick={() => { }}>Criar nova</button>
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
                            {selectedCampaign.id !== "" &&
                                <div className="card-content">
                                    <div className="content">
                                        <p>Nome: {selectedCampaign.name}</p>
                                        <p>Data de disparo: {selectedCampaign.createdAt ? moment(selectedCampaign.createdAt.toString()).format("DD/MM/YYYY") : ""}</p>
                                        <p>Contatos impactados: <strong>{selectedCampaign.contacts.length}</strong></p>
                                        <ul style={{listStyle: "none"}}>
                                            {selectedCampaign.contacts.map(contact => <li key={contact.number}>{contact.name}</li>)}
                                        </ul>
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