import React, { useState, useEffect } from 'react';
import { Search, Home, BarChart2, ShoppingBag, Megaphone, Loader2, X, MessageSquare } from 'lucide-react';

const validUsers: Record<string, string> = {
  'Carhartt534': 'Carhartt534',
  'Columbia267': 'Columbia267',
  'Manager165': 'Manager165'
};

const userAttributes: Record<string, string> = {
  'Carhartt534': 'Carhartt',
  'Columbia267': 'Columbia',
  'Manager165': 'Carhartt, Columbia'
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analytics');
  const [currentTheme, setCurrentTheme] = useState('Looker_Embed_Demo');
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [showDemoTools, setShowDemoTools] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showEmbedMethod, setShowEmbedMethod] = useState(false);
  const [embedPayload, setEmbedPayload] = useState<any>(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [userInfoTab, setUserInfoTab] = useState<'json' | 'typescript' | 'python'>('json');

  useEffect(() => {
    if (currentUser && activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [currentUser, currentTheme, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (validUsers[username] && validUsers[username] === password) {
        setCurrentUser(username);
        setActiveTab('analytics');
      } else {
        setError('Invalid username or password.');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setIframeUrl(null);
    setCurrentTheme('looker_embed_demo');
  };

  const loadAnalytics = async () => {
    if (!currentUser) return;
    
    setIsIframeLoading(true);
    setIframeUrl(null);
    
    try {
      const attribute = userAttributes[currentUser];
      const response = await fetch('/api/get-embed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: attribute,
          theme: currentTheme 
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned a non-JSON response. Status: ${response.status}. Body: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.url) {
        setIframeUrl(data.url);
        if (data.payload) {
          setEmbedPayload(data.payload);
        }
      } else {
        throw new Error(data.error || 'Unknown error from server.');
      }
    } catch (err: any) {
      console.error('Error fetching signed URL:', err);
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setIsIframeLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center flex flex-col items-center">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 shadow-md rounded-xl">
              <rect width="32" height="32" rx="8" fill="url(#login-logo-gradient)"/>
              <path d="M9 22V15M16 22V9M23 22V13" stroke="#DEFFFC" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="16" cy="9" r="2" fill="#DEFFFC"/>
              <circle cx="23" cy="13" r="2" fill="#DEFFFC"/>
              <circle cx="9" cy="15" r="2" fill="#DEFFFC"/>
              <defs>
                <linearGradient id="login-logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6a1e40" />
                  <stop offset="1" stopColor="#511730" />
                </linearGradient>
              </defs>
            </svg>
            <h2 className="text-3xl font-extrabold text-gray-900 font-serif">
              Company Name
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Log in to view your analytics dashboard.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              (Use "Carhartt534", "Columbia267", or "Manager165" as username and password)
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-[#511730] focus:border-[#511730] sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-[#511730] focus:border-[#511730] sm:text-sm"
                placeholder="Password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md group bg-[#511730] hover:bg-[#6a1e40] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6a1e40] disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-5 h-5 mr-3 -ml-1 animate-spin" />}
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#320a28] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-[#320a28] border-r border-[#511730]">
        <div className="h-16 flex items-center justify-start px-6 border-b border-[#511730]">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 shadow-sm">
              <rect width="32" height="32" rx="8" fill="url(#logo-gradient)"/>
              <path d="M9 22V15M16 22V9M23 22V13" stroke="#DEFFFC" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="16" cy="9" r="2" fill="#DEFFFC"/>
              <circle cx="23" cy="13" r="2" fill="#DEFFFC"/>
              <circle cx="9" cy="15" r="2" fill="#DEFFFC"/>
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6a1e40" />
                  <stop offset="1" stopColor="#511730" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-serif text-xl text-white font-bold tracking-wide">Company Name</span>
          </div>
        </div>
        <nav className="flex-grow px-2 py-4">
          <ul className="space-y-2">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'marketing', label: 'Marketing', icon: Megaphone },
              { id: 'analytics', label: 'Analytics', icon: BarChart2 },
              { id: 'conversations', label: 'Data Conversations', icon: MessageSquare },
              { id: 'products', label: 'Products', icon: ShoppingBag },
            ].map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#511730] text-white font-semibold'
                      : 'text-gray-300 hover:bg-[#4d103c] hover:text-white'
                  }`}
                >
                  <tab.icon className="h-6 w-6 mr-3" />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#DEFFFC] text-gray-900">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-500" />
            </span>
            <input
              type="text"
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#511730]"
              placeholder="Search..."
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">Logged in as: {currentUser}</span>
            
            <div className="relative">
              <button
                onClick={() => setShowDemoTools(!showDemoTools)}
                className="bg-[#511730] text-sm text-white font-medium py-2 px-4 rounded-md hover:bg-[#6a1e40] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6a1e40]"
              >
                Demo Tools
              </button>
              
              {showDemoTools && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowEmbedMethod(!showEmbedMethod);
                        setShowDemoTools(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>Show Embed Method</span>
                      <div className={`w-8 h-4 rounded-full transition-colors ${showEmbedMethod ? 'bg-[#511730]' : 'bg-gray-300'} relative`}>
                        <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${showEmbedMethod ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setShowThemeMenu(!showThemeMenu)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Theme/ColorWay
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserInfoModal(true);
                        setShowDemoTools(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      User Information Transfer
                    </button>
                    
                    {showThemeMenu && (
                      <div className="absolute right-full top-0 mr-2 w-48 bg-white rounded-md shadow-lg py-1 z-30">
                        {[
                          { id: 'Looker_Embed_Demo', label: 'Light' },
                          { id: 'Looker_Embed_Demo_Dark', label: 'Dark' },
                          { id: 'Looker_Embed_Demo_Crazy', label: 'Crazy' },
                        ].map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => {
                              setCurrentTheme(theme.id);
                              setShowThemeMenu(false);
                              setShowDemoTools(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {theme.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-[#511730] text-sm text-white font-medium py-2 px-4 rounded-md hover:bg-[#6a1e40] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6a1e40]"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#DEFFFC] text-gray-900">
          {activeTab === 'home' && (
            <div className="p-8">
              <h1 className="text-3xl font-bold">Welcome, {currentUser}!</h1>
              <p className="mt-4 text-gray-700">This is the homepage of your Looker SSO Embed Demo.</p>
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="p-8">
              <h1 className="text-3xl font-bold">Marketing</h1>
              <p className="mt-4 text-gray-700">This page is a placeholder for marketing content.</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className={`h-full relative ${showEmbedMethod ? 'p-6' : ''}`}>
              {showEmbedMethod && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-yellow-400 rounded-md px-2 py-1 flex items-center gap-1.5 shadow-md z-20">
                  <img src="https://www.svgrepo.com/show/354012/looker-icon.svg" alt="Looker Logo" className="w-3.5 h-3.5" />
                  <span className="font-semibold text-gray-800 text-[10px] uppercase tracking-wider">Looker iframe</span>
                </div>
              )}
              
              <div className={`w-full h-full relative ${showEmbedMethod ? 'border-2 border-yellow-400 rounded-xl overflow-hidden shadow-[0_0_10px_rgba(250,204,21,0.3)]' : ''}`}>
                {isIframeLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#DEFFFC] z-10">
                    <div className="flex items-center text-gray-700">
                      <Loader2 className="w-16 h-16 animate-spin text-[#511730]" />
                      <span className="ml-4 text-xl">Loading Dashboard...</span>
                    </div>
                  </div>
                )}
                {error ? (
                  <div className="p-8 text-red-600 font-medium">{error}</div>
                ) : (
                  iframeUrl && (
                    <iframe
                      src={iframeUrl}
                      className="w-full h-full border-none"
                      title="Looker Dashboard"
                    />
                  )
                )}
              </div>
            </div>
          )}

          {activeTab === 'conversations' && (
            <div className={`h-full relative ${showEmbedMethod ? 'p-6' : ''}`}>
              {showEmbedMethod && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-yellow-400 rounded-md px-2 py-1 flex items-center gap-1.5 shadow-md z-20">
                  <img src="https://www.svgrepo.com/show/354012/looker-icon.svg" alt="Looker Logo" className="w-3.5 h-3.5" />
                  <span className="font-semibold text-gray-800 text-[10px] uppercase tracking-wider">Looker iframe</span>
                </div>
              )}
              
              <div className={`w-full h-full relative ${showEmbedMethod ? 'border-2 border-yellow-400 rounded-xl overflow-hidden shadow-[0_0_10px_rgba(250,204,21,0.3)]' : ''}`}>
                <iframe
                  src={`https://7d9da728-3eaf-4944-965c-d1d56538803c.looker.app/embed/conversations?theme=${currentTheme}`}
                  className="w-full h-full border-none"
                  title="Data Conversations"
                />
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="p-8">
              <h1 className="text-3xl font-bold">Products</h1>
              <p className="mt-4 text-gray-700">This page is a placeholder for products content.</p>
            </div>
          )}
        </main>
      </div>

      {/* User Info Modal */}
      {showUserInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">User Information Transfer</h3>
              <button 
                onClick={() => setShowUserInfoModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-white">
              <p className="text-sm text-gray-700 mb-4">
                User info passed from your app to Looker via the{' '}
                <a 
                  href="https://docs.cloud.google.com/looker/docs/reference/looker-api/latest/methods/Auth/create_sso_embed_url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#511730] font-semibold hover:underline"
                >
                  create_signed_embed_url
                </a>{' '}
                Looker API endpoint:
              </p>
              
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setUserInfoTab('json')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${userInfoTab === 'json' ? 'border-[#511730] text-[#511730]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  JSON object
                </button>
                <button
                  onClick={() => setUserInfoTab('typescript')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${userInfoTab === 'typescript' ? 'border-[#511730] text-[#511730]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  TypeScript SDK
                </button>
                <button
                  onClick={() => setUserInfoTab('python')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${userInfoTab === 'python' ? 'border-[#511730] text-[#511730]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Python SDK
                </button>
              </div>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                <pre className="font-mono text-sm whitespace-pre-wrap break-all">
                  {!embedPayload ? 'No payload data available.' : (
                    userInfoTab === 'json' ? JSON.stringify(embedPayload, null, 2) :
                    userInfoTab === 'typescript' ? `import { LookerNodeSDK } from '@looker/sdk-node';

const sdk = LookerNodeSDK.init40();

const embedParams = ${JSON.stringify(embedPayload, null, 2)};

const signedUrl = await sdk.ok(sdk.create_sso_embed_url(embedParams));
console.log(signedUrl.url);` :
                    `import looker_sdk

sdk = looker_sdk.init40()

embed_params = ${JSON.stringify(embedPayload, null, 4).replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None')}

signed_url = sdk.create_sso_embed_url(
    looker_sdk.models.EmbedSsoParams(**embed_params)
)
print(signed_url.url)`
                  )}
                </pre>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowUserInfoModal(false)}
                className="px-4 py-2 bg-[#511730] text-white rounded-md hover:bg-[#6a1e40] transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
