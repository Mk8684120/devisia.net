import React, { useState } from 'react';
import { User, Lock, Mic, AlertCircle, Eye, EyeOff, Mail, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const LoginForm: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { companyInfo } = useData();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // Au moins 6 caractères et au moins une majuscule
    if (password.length < 6) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins 6 caractères' };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
    }
    
    return { isValid: true, message: '' };
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    let feedback = [];

    if (password.length >= 6) strength += 1;
    else feedback.push('6 caractères minimum');

    if (/[A-Z]/.test(password)) strength += 1;
    else feedback.push('1 majuscule');

    if (/[a-z]/.test(password)) strength += 1;
    else feedback.push('1 minuscule');

    if (/\d/.test(password)) strength += 1;
    else feedback.push('1 chiffre');

    if (/[@$!%*?&]/.test(password)) strength += 1;
    else feedback.push('1 caractère spécial');

    return { strength, feedback };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Validation pour l'inscription
        if (!username.trim()) {
          setError('Le nom d\'utilisateur est requis');
          return;
        }
        
        if (username.length < 3) {
          setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
          return;
        }

        if (!email.trim()) {
          setError('L\'adresse email est requise');
          return;
        }

        if (!validateEmail(email)) {
          setError('Veuillez entrer une adresse email valide');
          return;
        }

        if (!password) {
          setError('Le mot de passe est requis');
          return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          setError(passwordValidation.message);
          return;
        }

        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }

        const success = await register(username, email, password);
        if (success) {
          setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
          setIsRegistering(false);
          setUsername('');
          setPassword('');
          setConfirmPassword('');
          setEmail('');
        } else {
          setError('Ce nom d\'utilisateur ou cette adresse email existe déjà');
        }
      } else {
        // Connexion
        const success = await login(username, password);
        if (!success) {
          setError('Nom d\'utilisateur ou mot de passe incorrect');
        }
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
  };

  const passwordStrength = isRegistering ? getPasswordStrength(password) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-600">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                <Mic className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Planificateur Pro</h1>
            <p className="text-gray-300">Rendez-vous & Devis Vocaux</p>
            <div className="mt-4 p-3 bg-blue-900/30 rounded-xl border border-blue-500/30">
              <p className="text-sm text-blue-300 font-medium">{companyInfo.name}</p>
              <p className="text-xs text-gray-400">
                {isRegistering ? 'Créez votre compte' : 'Connectez-vous à votre plateforme'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {(error || success) && (
              <div className={`border rounded-xl p-4 flex items-center space-x-3 ${
                error 
                  ? 'bg-red-900/50 border-red-600 text-red-300' 
                  : 'bg-green-900/50 border-green-600 text-green-300'
              }`}>
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error || success}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Entrez votre nom d'utilisateur"
                  required
                />
              </div>
              {isRegistering && (
                <p className="text-xs text-gray-400 mt-1">
                  Au moins 3 caractères, lettres et chiffres uniquement
                </p>
              )}
            </div>

            {isRegistering && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-700 text-white placeholder-gray-400"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {isRegistering && password && (
                <div className="mt-2">
                  {/* Barre de force du mot de passe */}
                  <div className="flex space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength && passwordStrength.strength >= level
                            ? passwordStrength.strength <= 2
                              ? 'bg-red-500'
                              : passwordStrength.strength <= 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Exigences du mot de passe */}
                  <div className="text-xs space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${password.length >= 6 ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={password.length >= 6 ? 'text-green-400' : 'text-red-400'}>
                        6 caractères minimum (requis)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-red-400'}>
                        1 majuscule (requis)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <span className={/[a-z]/.test(password) ? 'text-green-400' : 'text-gray-400'}>
                        1 minuscule (recommandé)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <span className={/\d/.test(password) ? 'text-green-400' : 'text-gray-400'}>
                        1 chiffre (recommandé)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${/[@$!%*?&]/.test(password) ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <span className={/[@$!%*?&]/.test(password) ? 'text-green-400' : 'text-gray-400'}>
                        1 caractère spécial (recommandé)
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {!isRegistering && (
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 6 caractères avec au moins 1 majuscule
                </p>
              )}
            </div>

            {isRegistering && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Confirmez votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isRegistering ? 'Création...' : 'Connexion...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  {isRegistering ? <UserPlus className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  <span>{isRegistering ? 'Créer le compte' : 'Se connecter'}</span>
                </div>
              )}
            </button>
          </form>

          {/* Toggle between login and register */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center justify-center space-x-2 mx-auto"
            >
              {isRegistering ? (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour à la connexion</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Créer un nouveau compte</span>
                </>
              )}
            </button>
          </div>

          {/* Features Preview */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-gray-700/50 rounded-xl p-3 text-center">
              <Mic className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-gray-300 font-medium">Contrôle vocal</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3 text-center">
              <div className="text-lg mb-2">📋</div>
              <p className="text-xs text-gray-300 font-medium">Devis automatiques</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;