const fs = require('fs');

// 1. Modify Login.tsx
let loginC = fs.readFileSync('src/components/Login.tsx', 'utf8');

loginC = loginC.replace(
  /interface LoginProps \{[\s\S]*?\}/,
  `interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
  onBack?: () => void;
}`
);

loginC = loginC.replace(
  /export default function Login\(\{ onLoginSuccess \}: LoginProps\) \{/,
  'export default function Login({ onLoginSuccess, onBack }: LoginProps) {'
);

const cardTarget = `<div className="bg-slate-300/50 p-[1px] rounded-2xl max-w-md w-full relative z-10">
        <div className="bg-slate-100 rounded-2xl p-8 shadow-2xl relative overflow-hidden">`;

const cardReplacement = `<div className="bg-slate-300/50 p-[1px] rounded-2xl max-w-md w-full relative z-10">
        <div className="bg-slate-100 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Volver
            </button>
          )}`;

loginC = loginC.replace(cardTarget, cardReplacement);
fs.writeFileSync('src/components/Login.tsx', loginC);


// 2. Modify App.tsx
let appC = fs.readFileSync('src/App.tsx', 'utf8');

const appTarget = `if (showAdminLogin) {
      return (
        <div className="relative min-h-screen">
          <button onClick={() => setShowAdminLogin(false)} className="absolute top-6 left-6 md:top-8 md:left-8 z-50 px-5 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> Volver al Portal</button>
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      );
    }`;

const appReplacement = `if (showAdminLogin) {
      return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setShowAdminLogin(false)} />;
    }`;

appC = appC.replace(appTarget, appReplacement);
fs.writeFileSync('src/App.tsx', appC);
