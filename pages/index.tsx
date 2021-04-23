import { signIn, signOut, useSession, getCsrfToken } from 'next-auth/client'
import Link from 'next/link'
import moment from 'moment'
import { GetServerSideProps } from 'next'


export default function Index({ csrfToken }) {

  const [session, loading] = useSession()

  const date = moment().format('LLL')

  return (
    <>
      <section className="section">
        <div className="container">
          <h1 className="title">
            Bem-vindo(a) ao NexBot
            {session && <b> {session.user.name}</b>}
          </h1>
          <p className="subtitle">
            {date}
          </p>
        </div>
      </section>

      {session &&
        <section className="section">
          <div className="columns is-variable is-1-mobile is-0-tablet is-3-desktop is-8-widescreen is-2-fullhd is-multiline">
            <div className="column">
              <div className="box">
                <Link href="/home">
                  <a><strong>Acessar o bot</strong></a>
                </Link>
              </div>
            </div>
            <div className="column">
              <div className="box">
                <Link href="/campaign">
                  <a><strong>Listas de transmissão</strong></a>
                </Link>
              </div>
            </div>
            <div className="column">
              <div className="box">
              <Link href="/settings">
                  <a><strong>Configurações</strong></a>
                </Link>
              </div>
            </div>
          </div>
        </section>}

      {!session &&
        <section className="section">
          <div className="container">
            <form method="post" action="/api/auth/callback/credentials">
              <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
              <div className="field">
                <label className="label">Usuário:</label>
                <div className="control">
                  <input name="username" type="text" placeholder="josedasilva@emaildaempresa.com.br" className="input" required />
                </div>
              </div>
              <div className="field">
                <label className="label">Senha:</label>
                <div className="control">
                  <input type="password" name="password" placeholder="senha" className="input" required />
                </div>
              </div>
              <div className="control">
                <button className="button is-primary is-right" type="submit">ENTRAR</button>
              </div>
            </form>
          </div>
        </section>}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {

  return {
    props: {
      csrfToken: await getCsrfToken(context)
    }
  }
}