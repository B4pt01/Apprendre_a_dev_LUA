import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div>
      <h1 className="page-title">Page introuvable</h1>
      <p>Cette route n’existe pas dans l’atelier.</p>
      <Link className="btn primary" to="/">
        Accueil
      </Link>
    </div>
  )
}
