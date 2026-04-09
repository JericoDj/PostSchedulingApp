import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowRight, Github, Chrome } from 'lucide-react';
import { GlassCard, Button, Input } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';



export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.statusChangeCallback = async function(response) {
      console.log('statusChangeCallback', response);
      if (response.status === 'connected') {
        try {
          await loginWithFacebook(response.authResponse.accessToken, response.authResponse.userID);
          navigate('/dashboard');
        } catch (err) {
          setError(err.message || 'Facebook login failed');
        }
      } else {
        console.log('Not authenticated with Facebook');
      }
    };

    window.checkLoginState = function() {
      if (window.FB) {
        window.FB.getLoginStatus(function(response) {
          window.statusChangeCallback(response);
        });
      }
    };
  }, [loginWithFacebook, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setError('');
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password });
      }

      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mx-auto mb-6">
            <Zap className="text-white fill-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">SocialSync AI</h1>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Welcome back! Please enter your details.' : 'Create an account to start automating.'}
          </p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isLogin && (
                <div className="text-right">
                  <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button className="w-full py-3" type="submit" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#030712] px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" className="py-2.5">
                <Chrome size={18} />
                Google
              </Button>
              <div className="flex justify-center items-center h-full">
                <fb:login-button 
                  scope="public_profile"
                  onlogin="checkLoginState();">
                </fb:login-button>
              </div>
            </div>
          </form>
        </GlassCard>

        <p className="text-center text-slate-400 mt-8 text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};