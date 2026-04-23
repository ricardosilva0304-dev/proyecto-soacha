import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  const links = [
    { path: '/inventario', label: '📦 Inventario' },
    { path: '/clientes', label: '👥 Clientes' },
    { path: '/pos', label: '🛒 Punto de Venta' },
  ]

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">🏪 GestiónSoacha</h1>
        <div className="flex gap-4">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === link.path
                  ? 'bg-white text-blue-700'
                  : 'hover:bg-blue-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar