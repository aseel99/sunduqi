{/* Mobile Sidebar Overlay */}
<div className={`fixed inset-0 bg-white z-50 transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
  {/* Header */}
  <div className="flex items-center justify-between px-4 py-4 border-b bg-yellow-400">
    <div className="flex items-center">
      <img src={logo} alt="شعار صندوقي" className="h-8 w-auto mr-2" />
      <span className="text-lg font-bold text-gray-900">صندوقي</span>
    </div>
    <button onClick={() => setMobileMenuOpen(false)}>
      <svg className="h-6 w-6 text-gray-800 hover:text-red-600" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  {/* Navigation Items */}
  <nav className="p-4 space-y-1">
    {filteredLinks.map(link =>
      link.type === 'submenu' ? (
        <div key="submenu" className="space-y-1">
          <button
            onClick={() => setSubmenuOpen(!submenuOpen)}
            className={`w-full flex justify-between items-center px-4 py-2 rounded-md font-medium ${
              submenuOpen ? 'bg-yellow-100 text-yellow-800' : 'text-gray-800 hover:bg-gray-100'
            } text-base`}
          >
            <span className="flex items-center">
              <span className="ml-2">📂</span> تفاصيل الكاش والسندات
            </span>
            <svg className={`h-4 w-4 transform transition-transform ${submenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {submenuOpen && (
            <div className="pl-6 space-y-1">
              {link.children.map(child => (
                <Link
                  key={child.path}
                  to={child.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-md text-base font-medium ${
                    location.pathname === child.path
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="ml-2">{child.icon}</span> {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Link
          key={link.path}
          to={link.path}
          onClick={() => setMobileMenuOpen(false)}
          className={`block px-4 py-2 rounded-md text-base font-medium flex items-center ${
            location.pathname === link.path
              ? 'bg-yellow-100 text-yellow-800'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="ml-2">{link.icon}</span>
          {link.name}
          {link.badge > 0 && (
            <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
              {link.badge}
            </span>
          )}
        </Link>
      )
    )}
  </nav>
</div>
