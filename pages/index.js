// pages/index.js (VERSÃO ATUALIZADA)

import { useState, useRef } from 'react';
import Game from '../components/Game';
import LoginScreen from '../components/LoginScreen';
import Leaderboard from '../components/Leaderboard';
import SkinsScreen from '../components/SkinsScreen'; // NOVO: Importa o novo componente
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function HomePage() {
    // ALTERAÇÃO: Adicionado 'skins' às vistas possíveis
    const [view, setView] = useState('login'); // 'login', 'game', 'leaderboard', 'skins'
    const [username, setUsername] = useState('');
    
    // NOVO: State para guardar a skin selecionada. Começa com a skin padrão.
    const [selectedSkin, setSelectedSkin] = useState('/images/dino.png');

    const gameRef = useRef(null);

    const handlePlay = () => {
        if (username.trim().length >= 3) {
            setView('game');
        }
    };

    const handleShowLeaderboard = () => {
        setView('leaderboard');
    };

    // NOVO: Função para mostrar o ecrã de skins
    const handleShowSkins = () => {
        setView('skins');
    };

    const handleBackToLogin = () => {
        setView('login');
    };

    const handleGameOver = async (score) => {
        // ... (a tua lógica de game over permanece igual)
    };

    const handleGoToLeaderboard = () => {
        setView('leaderboard');
    };

    const handleJumpButtonClick = () => {
        gameRef.current?.triggerJump();
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-200">
            {view === 'login' && (
                <LoginScreen 
                    username={username}
                    setUsername={setUsername}
                    onPlay={handlePlay}
                    onShowLeaderboard={handleShowLeaderboard}
                    onShowSkins={handleShowSkins} // NOVO: Passa a função para o LoginScreen
                />
            )}

            {view === 'leaderboard' && <Leaderboard onBack={handleBackToLogin} />}

            {/* NOVO: Renderiza o ecrã de skins quando a vista for 'skins' */}
            {view === 'skins' && (
                <SkinsScreen
                    currentSkin={selectedSkin}
                    onSelectSkin={setSelectedSkin}
                    onBack={handleBackToLogin}
                />
            )}

            {view === 'game' && (
                <div className="flex w-full flex-col items-center">
                    <Game 
                        ref={gameRef} 
                        username={username}
                        onGameOver={handleGameOver} 
                        onGoToLeaderboard={handleGoToLeaderboard} 
                        skin={selectedSkin} // ALTERAÇÃO: Passa a skin selecionada para o jogo
                    />
                    <button
                        onClick={handleJumpButtonClick}
                        className="mt-6 px-8 py-4 bg-blue-500 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-blue-600 active:bg-blue-700 transition-transform transform active:scale-95"
                        aria-label="Pular"
                    >
                        PULAR
                    </button>
                </div>
            )}
        </main>
    );
}