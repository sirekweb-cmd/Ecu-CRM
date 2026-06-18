const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

if (!c.includes('import PublicPortal')) {
  c = c.replace(
    /import Login from '\.\/components\/Login';/,
    "import Login from './components/Login';\nimport PublicPortal from './components/PublicPortal';"
  );
}

if (!c.includes('const [showAdminLogin, setShowAdminLogin]')) {
  c = c.replace(
    /const \[token, setToken\] = useState<string \| null>[^;]+;\s*\n/,
    "$&  const [showAdminLogin, setShowAdminLogin] = useState(false);\n"
  );
}

c = c.replace(
  /if \(!currentUser \|\| !token\) \{\s*return <Login onLoginSuccess=\{handleLoginSuccess\} \/>;\s*\}/,
  `if (!currentUser || !token) {
    if (showAdminLogin) {
      return (
        <div className="relative min-h-screen">
          <button onClick={() => setShowAdminLogin(false)} className="absolute top-6 left-6 z-50 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">Volver al Portal Público</button>
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      );
    }
    return (
      <PublicPortal 
        products={products}
        onShowLogin={() => setShowAdminLogin(true)}
        onSubmitQuote={async (quoteData) => {
          const res = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quoteData)
          });
          if (!res.ok) throw new Error('Error saving quote');
        }}
      />
    );
  }`
);

fs.writeFileSync('src/App.tsx', c);
