import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Loader2, CheckCircle, Zap, BookOpen } from 'lucide-react';

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/app');
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Falha ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl relative group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
            <FileText size={40} className="text-white relative z-10" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            PDF Sage
          </h1>
          <p className="text-gray-300 text-lg font-light">
            Leitura inteligente de PDFs com IA
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-700 backdrop-blur-xl relative overflow-hidden">
          {/* Card decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none rounded-3xl"></div>

          <h2 className="text-3xl font-bold text-white mb-2 text-center relative z-10">
            Bem-vindo!
          </h2>
          <p className="text-gray-400 text-center mb-8 text-sm relative z-10">
            Faça login para começar a analisar seus documentos
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-sm flex items-start gap-3 relative z-10 backdrop-blur-sm">
              <div className="mt-0.5 flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 relative z-10 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-full group-hover:translate-x-0"></div>
            {loading ? (
              <>
                <Loader2 size={22} className="animate-spin relative z-10" />
                <span className="relative z-10">Autenticando...</span>
              </>
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" className="relative z-10">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="relative z-10">Entrar com Google</span>
              </>
            )}
          </button>

          <div className="mt-8 pt-8 border-t border-gray-700 relative z-10">
            <p className="text-xs text-gray-400 text-center">
              Ao entrar, você concorda com nossos{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">Termos de Uso</a>
              {' '}e{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">Política de Privacidade</a>
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          <div className="group cursor-pointer">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4 text-center transition-all duration-300 hover:border-blue-400/60 hover:bg-blue-500/30 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="flex justify-center mb-3">
                <Zap size={24} className="text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-xs font-semibold text-blue-300 group-hover:text-blue-200 transition-colors">Chat com IA</p>
            </div>
          </div>

          <div className="group cursor-pointer">
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4 text-center transition-all duration-300 hover:border-purple-400/60 hover:bg-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex justify-center mb-3">
                <CheckCircle size={24} className="text-purple-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-xs font-semibold text-purple-300 group-hover:text-purple-200 transition-colors">Análise</p>
            </div>
          </div>

          <div className="group cursor-pointer">
            <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 rounded-xl p-4 text-center transition-all duration-300 hover:border-pink-400/60 hover:bg-pink-500/30 hover:shadow-lg hover:shadow-pink-500/20">
              <div className="flex justify-center mb-3">
                <BookOpen size={24} className="text-pink-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-xs font-semibold text-pink-300 group-hover:text-pink-200 transition-colors">Leitura</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          <p>PDF Sage © 2024 - Inteligência Artificial para Documentos</p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
