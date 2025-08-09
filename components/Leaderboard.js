// --- components/Leaderboard.js (VERSÃO ATUALIZADA) ---
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const Leaderboard = ({ onBack }) => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // NOVO: State para guardar o erro

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const q = query(
                    collection(db, 'leaderboard'),
                    orderBy('highScore', 'desc'),
                    limit(10)
                );
                
                const querySnapshot = await getDocs(q);
                const scoresData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setScores(scoresData);
            } catch (err) {
                console.error("ERRO DETALHADO DO FIREBASE: ", err);
                // NOVO: Define uma mensagem de erro amigável
                setError("Não foi possível carregar o Leaderboard. Verifique se o índice do Firestore foi criado. (Ver consola para detalhes)");
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, []);

    return (
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Leaderboard - Top 10</h1>
            {loading && <p className="text-center">A carregar...</p>}
            
            {/* NOVO: Mostra a mensagem de erro no ecrã */}
            {error && <p className="text-center text-red-500 font-semibold bg-red-100 p-3 rounded-md">{error}</p>}
            
            {!loading && !error && scores.length === 0 && (
                <p className="text-center text-gray-500">Ainda não há pontuações. Sê o primeiro!</p>
            )}

            {!loading && !error && scores.length > 0 && (
                <ol className="list-decimal list-inside space-y-2">
                    {scores.map((score, index) => (
                        <li key={score.id} className="text-lg flex justify-between p-2 rounded bg-gray-100">
                            <span>{index + 1}. {score.username}</span>
                            <span className="font-bold">{score.highScore}</span>
                        </li>
                    ))}
                </ol>
            )}
            <button
                onClick={onBack}
                className="mt-6 w-full px-6 py-3 text-lg text-white bg-gray-500 rounded-md cursor-pointer transition-colors hover:bg-gray-600"
            >
                Voltar
            </button>
        </div>
    );
};

export default Leaderboard;