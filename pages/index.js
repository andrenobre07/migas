// --- pages/index.js (VERSÃO ATUALIZADA) ---
import { useState, useRef } from 'react';
import Game from '../components/Game';
import LoginScreen from '../components/LoginScreen';
import Leaderboard from '../components/Leaderboard';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function HomePage() {
    const [view, setView] = useState('login'); // 'login', 'game', 'leaderboard'
    const [username, setUsername] = useState('');
    
    const gameRef = useRef(null);

    const handlePlay = () => {
        if (username.trim().length >= 3) {
            setView('game');
        }
    };

    const handleShowLeaderboard = () => {
        setView('leaderboard');
    };

    const handleBackToLogin = () => {
        setView('login');
    };

    // ALTERAÇÃO: Esta função agora só guarda a pontuação. Não muda mais o ecrã.
    const handleGameOver = async (score) => {
        console.log(`Fim de jogo para ${username} com a pontuação: ${score}`);
        if (!username) return; // Evita guardar pontuação sem nome de utilizador

        try {
            const userDocRef = doc(db, 'leaderboard', username.toLowerCase());
            const userDoc = await getDoc(userDocRef);

            let currentHighScore = 0;
            if (userDoc.exists()) {
                currentHighScore = userDoc.data().highScore || 0;
            }

            if (score > currentHighScore) {
                console.log(`Novo recorde! A guardar ${score} para ${username}`);
                await setDoc(userDocRef, {
                    username: username,
                    highScore: score,
                    lastUpdated: new Date(),
                }, { merge: true }); // Usar merge para não apagar outros campos
            }
        } catch (error) {
            console.error("Erro ao guardar a pontuação: ", error);
        }
        // A linha setView('login') foi removida daqui.
    };

    // NOVO: Esta função muda o ecrã para o leaderboard.
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
                />
            )}

            {view === 'leaderboard' && <Leaderboard onBack={handleBackToLogin} />}

            {view === 'game' && (
                <div className="flex w-full flex-col items-center">
                    <Game 
                        ref={gameRef} 
                        username={username}
                        onGameOver={handleGameOver} 
                        onGoToLeaderboard={handleGoToLeaderboard} // Passamos a nova função como prop
                    />
    <button 
    onClick={handleJumpButtonClick}
    className="mt-6 bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 active:bg-blue-700 transition-transform transform active:scale-95"
    style={{
        fontSize: '2rem',
        padding: '1rem 5rem', // top-bottom 5rem, left-right 10rem
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