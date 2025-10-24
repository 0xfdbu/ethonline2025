// src/pages/Home.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Zap, Shield, Layers, Play, ArrowRight, Clock, CheckCircle } from 'lucide-react';

const Home: React.FC = () => {
  const { isConnected } = useAccount();

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Execute cross-chain transfers in seconds with intent-based bridging'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Trustless',
      description: 'Built on Avail DA with cryptographic security guarantees'
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Multi-Chain Support',
      description: 'Bridge assets across multiple blockchains seamlessly'
    }
  ];

  return (
    <div className="flex-1 flex flex-col relative min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 lg:px-8 pt-16 lg:pt-24 pb-16 lg:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-xl rounded-full border border-slate-200/50 text-sm text-gray-700 font-medium mb-4">
              <Zap className="w-4 h-4 text-gray-600" />
              Powered by Avail Nexus
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight">
              Unified Multichain
              <br />
              <span className="text-gray-600">Portfolio</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Bridge assets seamlessly across chains with intent-based technology. Fast, secure, and simple.
            </p>
          </div>

          {!isConnected && (
            <div className="max-w-xl mx-auto mb-8">
              <div className="bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                  <Zap className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600">Connect to start bridging across chains</p>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/bridge"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Play size={20} />
              Launch Bridge
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              to="/explorer"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/20 text-gray-900 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Explore Intents
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 lg:px-8 py-16 lg:py-20 bg-gradient-to-b from-transparent to-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Avail Nexus?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the future of cross-chain bridging with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-6 space-y-4 transition-all duration-300 hover:bg-white/25 hover:shadow-lg"
                style={{
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  animationDelay: `${idx * 150}ms`,
                  opacity: 0
                }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-700 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 lg:px-8 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600">
              Bridge your assets in three simple steps
            </p>
          </div>

          <div className="space-y-6">
            {[
              { step: 1, title: 'Select Assets & Chains', desc: 'Choose the token and destination chain for your transfer', icon: <Layers className="w-6 h-6" /> },
              { step: 2, title: 'Create Intent', desc: 'Submit your bridging intent to the Avail network', icon: <Clock className="w-6 h-6" /> },
              { step: 3, title: 'Receive Assets', desc: 'Your assets arrive on the destination chain securely', icon: <CheckCircle className="w-6 h-6" /> }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-6 flex items-start gap-6 transition-all duration-300 hover:bg-white/25"
                style={{
                  animation: 'slideInRight 0.6s ease-out forwards',
                  animationDelay: `${idx * 200}ms`,
                  opacity: 0
                }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-700 font-bold text-lg shadow-sm">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-700 border border-slate-200/30">
                  {item.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="px-4 lg:px-8 py-12 border-t border-slate-200/30">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            Powered by Avail Nexus • Secure, Intent-Driven Bridging
          </p>
        </div>
      </section>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export { Home };
export default Home;