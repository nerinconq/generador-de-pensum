import React, { useState } from 'react';


interface WelcomeScreenProps {
    onStart: (uniName: string, careerName: string, email: string, githubToken?: string) => void;
    theme: 'light' | 'dark';
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, theme }) => {
    const [uniName, setUniName] = useState('');
    const [careerName, setCareerName] = useState('');
    const [email, setEmail] = useState('');
    const [useGitHub, setUseGitHub] = useState(false);
    const [githubToken, setGithubToken] = useState('');

    const isDark = theme === 'dark';

    const handleStart = () => {
        if (!uniName.trim() || !careerName.trim() || !email.trim()) {
            alert("Por favor completa todos los campos.");
            return;
        }
        if (!email.includes('@')) {
            alert("Por favor ingresa un correo electrónico válido.");
            return;
        }
        if (useGitHub && !githubToken.trim()) {
            alert("Por favor ingresa tu GitHub Personal Access Token o desactiva 'Usar GitHub Storage'.");
            return;
        }
        onStart(uniName, careerName, email, useGitHub ? githubToken : undefined);
    };

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>

            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-indigo-600' : 'bg-indigo-300'}`}></div>
                <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 ${isDark ? 'bg-purple-600' : 'bg-purple-300'}`}></div>
            </div>

            <div className={`relative z-10 w-full max-w-lg p-8 rounded-2xl shadow-2xl border backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/70 border-white'}`}>
                <div className="text-center mb-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center shadow-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h1 className={`text-3xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Career Architect</h1>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Diseña y estructura programas académicos profesionales.</p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="usuario@ejemplo.com"
                            className={`w-full p-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Nombre Universidad
                        </label>

                        <input
                            type="text"
                            value={uniName}
                            onChange={(e) => setUniName(e.target.value)}
                            placeholder="Ej. Universidad Militar Nueva Granada"
                            className={`w-full p-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
                        />
                    </div>

                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Nombre de la Carrera
                        </label>
                        <input
                            type="text"
                            value={careerName}
                            onChange={(e) => setCareerName(e.target.value)}
                            placeholder="Ej. Ingeniería de Software"
                            className={`w-full p-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
                        />
                    </div>

                    {/* GitHub Storage Toggle */}
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useGitHub}
                                onChange={(e) => setUseGitHub(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className={`ml-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Usar GitHub Storage (Multi-usuario)
                            </span>
                        </label>
                        {useGitHub && (
                            <div className="mt-3">
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    GitHub Personal Access Token
                                </label>
                                <input
                                    type="password"
                                    value={githubToken}
                                    onChange={(e) => setGithubToken(e.target.value)}
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                    className={`w-full p-2 text-sm rounded-lg border outline-none transition-all focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
                                />
                                <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <a href="https://github.com/settings/tokens/new?scopes=repo&description=Gestor%20Pensum" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                                        Generar token aquí
                                    </a> (requiere scope 'repo')
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleStart}
                        className="w-full py-4 mt-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        COMENZAR DISEÑO
                    </button>
                </div>

                <div className={`mt-6 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    v1.0.0 &bull; Career Curriculum Manager
                </div>
            </div>
        </div>
    );
};
