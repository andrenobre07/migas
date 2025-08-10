import { useState, useRef } from 'react';
import Game from '../components/Game';
import LoginScreen from '../components/LoginScreen';
import Leaderboard from '../components/Leaderboard';
import SkinsScreen from '../components/SkinsScreen';
import PatchNotesScreen from '../components/PatchNotesScreen'; // ADIÇÃO: Importa o novo componente
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function HomePage() {
    // ADIÇÃO: 'patchnotes' foi adicionado às vistas possíveis
    const [view, setView] = useState('login'); // 'login', 'game', 'leaderboard', 'skins', 'patchnotes'
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

    // ADIÇÃO: Nova função para mostrar o ecrã de Patch Notes
    const handleShowPatchNotes = () => {
        setView('patchnotes');
    };

    const handleBackToLogin = () => {
        setView('login');
    };

    const handleGameOver = async (score) => {
        console.log(`Fim de jogo para ${username} com a pontuação: ${score}`);
        if (!username) {
            console.error("Username está vazio, não é possível guardar a pontuação.");
            setView('login');
            return;
        }

        try {
            const userDocRef = doc(db, 'leaderboard', username.toLowerCase());
            const userDoc = await getDoc(userDocRef);

            let currentHighScore = 0;
            if (userDoc.exists()) {
                currentHighScore = userDoc.data().highScore;
            }

            if (score > currentHighScore) {
                console.log(`Novo recorde! A guardar ${score} para ${username}`);
                await setDoc(userDocRef, {
                    username: username,
                    highScore: score,
                    lastUpdated: serverTimestamp(),
                });
            } else {
                console.log(`Pontuação de ${score} não superou o recorde de ${currentHighScore}.`);
            }

        } catch (error) {
            console.error("Erro ao guardar a pontuação no Firebase: ", error);
        }

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
                    onShowPatchNotes={handleShowPatchNotes} // ADIÇÃO: Passa a nova função para o LoginScreen
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
            
            {/* ADIÇÃO: Renderiza o novo ecrã quando a vista for 'patchnotes' */}
            {view === 'patchnotes' && <PatchNotesScreen onBack={handleBackToLogin} />}

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
