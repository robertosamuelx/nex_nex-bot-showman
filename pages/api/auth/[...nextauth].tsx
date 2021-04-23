import NextAuth, { User } from 'next-auth'
import Providers from 'next-auth/providers'

export default NextAuth({
    providers: [
        Providers.Credentials({
            name: 'Credentials',
            credentials: {
                username: {
                    label: "Usuário",
                    type: "text",
                    placeholder: "josedasilva@empresa.com.br"
                },
                password: {
                    label: "Senha",
                    type: "password"
                }
            },
            async authorize(credentials) {
                console.log('chegou aqui')
                const res = await fetch(process.env.ENDPOINT_MANAGER + '/user/login', {
                    headers: {
                        'Content-Type': 'application/json'
                      },
                      method: 'POST',
                      body: JSON.stringify(credentials)
                })
                const json = await res.json()

                if(json.username)
                    return json
                else
                    return null

            }
        })
    ],
    pages: {
        signIn: '/',
        error: '/auth/error'
    }
})