// FileName: LoginPage.jsx

import React, { useState } from 'react';
import './global.css'; // 1. Importa o nosso novo arquivo CSS
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importando os ícones de olho

// --- 1. COMPONENTE DO CABEÇALHO (HEADER) ---
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para controlar o menu

    const menuItems = [
        'Home', 'Quem Somos', 'Como Ajudar', 'Voluntariado',
        'Imprensa', 'Transparência', 'Contato', 'Doações'
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="header">
            <div className="logo">
                <span className="logo-icon">☀️</span>
                <span>Instituto Maria Claro</span>
            </div>
            <nav className="nav">
                {/* Ícone do Menu Hambúrguer */}
                <div className="menu-icon" onClick={toggleMenu}>
                    ☰
                </div>
                {/* Lista de Links */}
                <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    {menuItems.map(item => (
                        <li key={item}>
                            <a href="#" className="nav-link">{item}</a>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

// --- 2. COMPONENTE DA FAIXA DE TÍTULO AZUL ---
const TitleBanner = () => {
    return (
        <div className="title-banner">
            <h1 className="banner-title">Doação</h1>
        </div>
    );
};

// --- 3. COMPONENTE DO CARD DE LOGIN 
const LoginCard = () => {  
  // Adicionar estados para controlar os inputs e a visibilidade da senha
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  //  Função para alternar a visibilidade da senha
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  return (
    <div className="login-card">
      <h2 className="card-title">Login</h2>
      <form>
        {/* Input de E-mail (agora controlado pelo estado) */}
        <input 
          type="email" 
          placeholder="Insira seu e-mail" 
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        {/* 4. Envolvemos o input de senha e o ícone em uma div para posicionamento */}
        <div className="input-wrapper">
          <input 
            // 5. O tipo do input muda de acordo com o estado
            type={isPasswordVisible ? 'text' : 'password'} 
            placeholder="Insira sua senha" 
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* 6. O ícone que é renderizado também muda e tem um evento de clique */}
          <span className="password-icon" onClick={togglePasswordVisibility}>
            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit" className="login-button">
          Entrar
        </button>
      </form>
      <a href="#" className="forgot-password-link">
        Esqueci minha senha
      </a>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
function LoginPage() {
    return (
        <div className="page-container">
            <Header />
            <TitleBanner />
            <main className="main-content">
                <LoginCard />
            </main>
        </div>
    );
}

export default LoginPage;