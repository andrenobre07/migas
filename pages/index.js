import { useState, useRef } from 'react';
import Game from '../components/Game';
import LoginScreen from '../components/LoginScreen';
import Leaderboard from '../components/Leaderboard';
import SkinsScreen from '../components/SkinsScreen';
import { db } from '../firebase/config';
// --- ALTERAÇÃO: Importar tudo o que precisamos do firestore ---
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function HomePage() {
    const [view, setView] = useState('login'); // 'login', 'game', 'leaderboard', 'skins'
    const [username, setUsername] = useState('');
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

    const handleShowSkins = () => {
        setView('skins');
    };

    const handleBackToLogin = () => {
        setView('login');
    };

    // --- ALTERAÇÃO PRINCIPAL: A função 'handleGameOver' agora tem a lógica para guardar no Firebase ---
    const handleGameOver = async (score) => {
        console.log(`Fim de jogo para ${username} com a pontuação: ${score}`);
        // Garante que não tentamos guardar uma pontuação sem um nome de utilizador
        if (!username) {
            console.error("Username está vazio, não é possível guardar a pontuação.");
            setView('login'); // Volta ao login se algo correr mal
            return;
        }

        try {
            // Cria uma referência ao documento do utilizador (usa toLowerCase para não duplicar utilizadores)
            const userDocRef = doc(db, 'leaderboard', username.toLowerCase());
            const userDoc = await getDoc(userDocRef);

            let currentHighScore = 0;
            // Se o documento do jogador já existir, lê a sua pontuação mais alta
            if (userDoc.exists()) {
                currentHighScore = userDoc.data().highScore;
            }

            // Apenas guarda no Firebase se a nova pontuação for um recorde
            if (score > currentHighScore) {
                console.log(`Novo recorde! A guardar ${score} para ${username}`);
                await setDoc(userDocRef, {
                    username: username, // Guarda o nome original para mostrar no leaderboard
                    highScore: score,
                    lastUpdated: serverTimestamp(), // Guarda a data/hora do servidor
                });
            } else {
                console.log(`Pontuação de ${score} não superou o recorde de ${currentHighScore}.`);
            }

        } catch (error) {
            console.error("Erro ao guardar a pontuação no Firebase: ", error);
        }

        // Depois de jogar, volta sempre para o ecrã de login
        setView('login');
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
                    onShowSkins={handleShowSkins}
                />
            )}

            {view === 'leaderboard' && <Leaderboard onBack={handleBackToLogin} />}

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
                        skin={selectedSkin}
                    />
                    <button 
                        onClick={handleJumpButtonClick}
                        className="mt-6 bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 active:bg-blue-700 transition-transform transform active:scale-95"
                        style={{
                            fontSize: '2rem',
                            padding: '1rem 5rem',
                            minWidth: '20rem'
                        }}
                        aria-label="Pular"
                    >
                        PULAR
                    </button>
                </div>
            )}
        </main>
    );
}