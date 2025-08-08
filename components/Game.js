// --- components/Game.js (VERSÃO ATUALIZADA) ---
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import HomePage from '@/pages';

// --- CONFIGURAÇÕES GLOBAIS ---
const DINO_IMAGE_PATH = '/images/dino.png';
const OBSTACLE_IMAGE_PATH = '/images/cactus.png';
const GAMEOVER_IMAGE_PATH = '/images/gameover.png'; // Imagem de Game Over
const BACKGROUND_IMAGE_PATH = '/images/background.png';

const BACKGROUND_AUDIO_PATH = '/audio/background.mp3';
const JUMP_AUDIO_PATH = '/audio/jump.mp3';
const HIT_AUDIO_PATH = '/audio/hit.mp3';

const GAME_SPEED_START = 6.5;
const GAME_SPEED_INCREMENT = 0.002;

const DINO_JUMP_FORCE = 32;
const GRAVITY = 1.55;

const OBSTACLE_INTERVAL_MIN = 900;  // Aumentei ligeiramente o intervalo mínimo
const OBSTACLE_INTERVAL_MAX = 1800; // Aumentei o intervalo máximo

const GROUND_HEIGHT_PX = 0;
const DINO_INITIAL_LEFT_PX = 50;
const DINO_WIDTH = 70;
const DINO_HEIGHT = 70;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 80;
// -----------------------------------------------------------------

// Adicionado onGoToLeaderboard como prop
const Game = forwardRef(({ username, onGameOver, onGoToLeaderboard }, ref) => {
    // --- State Hooks ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [isJumping, setIsJumping] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0); // Guarda a pontuação final
    const [dinoY, setDinoY] = useState(0);
    const [dinoVelocityY, setDinoVelocityY] = useState(0);
    const [obstacles, setObstacles] = useState([]);
    const [backgroundX, setBackgroundX] = useState(0);

    // --- Ref Hooks ---
    const gameContainerRef = useRef(null);
    const gameLoopRef = useRef(null);
    const obstacleTimerRef = useRef(null);
    const gameSpeedRef = useRef(GAME_SPEED_START);
    const stateRefs = useRef({ isPlaying, isJumping, isGameOver, dinoY, dinoVelocityY, score, obstacles });
    const audioRefs = useRef({ background: null, jump: null, hit: null });

    useEffect(() => {
        stateRefs.current = { isPlaying, isJumping, isGameOver, dinoY, dinoVelocityY, score, obstacles };
    }, [isPlaying, isJumping, isGameOver, dinoY, dinoVelocityY, score, obstacles]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRefs.current.background = new Audio(BACKGROUND_AUDIO_PATH);
            audioRefs.current.background.loop = true;
            audioRefs.current.jump = new Audio(JUMP_AUDIO_PATH);
            audioRefs.current.hit = new Audio(HIT_AUDIO_PATH);
        }
    }, []);

    const handleGameOver = useCallback(() => {
        if (stateRefs.current.isGameOver) return;

        setIsGameOver(true);
        setIsPlaying(false);
        cancelAnimationFrame(gameLoopRef.current);
        clearTimeout(obstacleTimerRef.current);

        const finalScoreValue = Math.floor(stateRefs.current.score);
        setFinalScore(finalScoreValue);

        audioRefs.current.background?.pause();
        audioRefs.current.hit?.play();

        if (typeof onGameOver === 'function') {
            onGameOver(finalScoreValue); // Envia a pontuação para ser guardada no Firebase
        }
    }, [onGameOver]);

    const startObstacleGenerator = useCallback(() => {
        const generate = () => {
            if (stateRefs.current.isPlaying && !stateRefs.current.isGameOver) {
                const containerWidth = gameContainerRef.current?.offsetWidth || 800;
                setObstacles(prev => [...prev, { x: containerWidth, id: Date.now() }]);
                
                // CORREÇÃO: O intervalo já não diminui com a velocidade, o que evita o excesso de cactos.
                const nextInterval = Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN) + OBSTACLE_INTERVAL_MIN;
                obstacleTimerRef.current = setTimeout(generate, nextInterval);
            }
        };
        generate();
    }, []);
    
    // ... (gameLoop e outros hooks permanecem iguais à versão anterior que te enviei)
    const gameLoop = useCallback(() => {
        if (!stateRefs.current.isPlaying || stateRefs.current.isGameOver) {
            return;
        }
        let newVelocity = stateRefs.current.dinoVelocityY - GRAVITY;
        let newY = stateRefs.current.dinoY + newVelocity;

        if (newY <= 0) {
            newY = 0;
            newVelocity = 0;
            setIsJumping(false);
        }
        setDinoY(newY);
        setDinoVelocityY(newVelocity);

        const speed = gameSpeedRef.current;
        setObstacles(prev =>
            prev
                .map(obstacle => ({ ...obstacle, x: obstacle.x - speed }))
                .filter(obstacle => obstacle.x > -OBSTACLE_WIDTH)
        );
        setBackgroundX(x => (x - speed * 0.5));

        const dinoRect = { x: DINO_INITIAL_LEFT_PX, y: newY, width: DINO_WIDTH, height: DINO_HEIGHT };
        for (const obstacle of stateRefs.current.obstacles) {
            const obstacleRect = { x: obstacle.x, y: 0, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT };
            if (
                dinoRect.x < obstacleRect.x + obstacleRect.width &&
                dinoRect.x + dinoRect.width > obstacleRect.x &&
                dinoRect.y < obstacleRect.y + obstacleRect.height &&
                dinoRect.y + dinoRect.height > obstacleRect.y
            ) {
                handleGameOver();
                return;
            }
        }
        setScore(s => s + 0.1);
        gameSpeedRef.current += GAME_SPEED_INCREMENT;
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [handleGameOver]);
    // ...

    const startGame = useCallback(() => {
        setIsGameOver(false);
        setScore(0);
        setFinalScore(0);
        setDinoY(0);
        setDinoVelocityY(0);
        setObstacles([]);
        setBackgroundX(0);
        gameSpeedRef.current = GAME_SPEED_START;
        
        setIsPlaying(true);

        audioRefs.current.background.currentTime = 0;
        audioRefs.current.background?.play().catch(e => console.error("Erro ao tocar música:", e));
    }, []);
    
    useEffect(() => {
        if (!isGameOver) { // Só inicia o jogo se não estiver em modo Game Over
            startGame();
        }
    }, []); // Este useEffect agora só corre uma vez para iniciar o jogo

    useEffect(() => {
        if (isPlaying) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
            startObstacleGenerator();
        } else {
            cancelAnimationFrame(gameLoopRef.current);
            clearTimeout(obstacleTimerRef.current);
        }
        return () => {
            cancelAnimationFrame(gameLoopRef.current);
            clearTimeout(obstacleTimerRef.current);
        };
    }, [isPlaying, gameLoop, startObstacleGenerator]);


    const handleJump = useCallback(() => {
        if (stateRefs.current.isPlaying && !stateRefs.current.isJumping) {
            setIsJumping(true);
            setDinoVelocityY(DINO_JUMP_FORCE);
            audioRefs.current.jump?.play();
        }
    }, []);

    useImperativeHandle(ref, () => ({
        triggerJump: handleJump,
    }));

    return (
        <div
            className="w-full max-w-5xl h-[70vh] border-2 border-gray-800 relative overflow-hidden bg-gray-100 mx-auto my-5"
            ref={gameContainerRef}
            style={{
                backgroundImage: `url(${BACKGROUND_IMAGE_PATH})`,
                backgroundRepeat: 'repeat-x',
                backgroundPosition: `${backgroundX}px 0`,
                backgroundSize: 'contain',
            }}
            tabIndex={0}
        >
            {/* --- ECRÃ DE GAME OVER --- */}
            {isGameOver && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-1/2 max-w-[300px] mb-4">
                        <Image src={GAMEOVER_IMAGE_PATH} alt="Game Over" width={384} height={76} layout="responsive" unoptimized/>
                    </div>
                    <p className="text-white text-3xl font-bold mb-6">Pontuação: {finalScore}</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={startGame} // Botão para reiniciar
                            className="px-6 py-3 bg-green-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-600 transition-colors"
                        >
                            Tentar Novamente
                        </button>
                        <button 
                            onClick={onGoToLeaderboard} // Botão para ir para o Leaderboard
                            className="px-6 py-3 bg-blue-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
                        >
                            Ver Leaderboard
                        </button>
                       
                    </div>
                </div>
            )}

            {/* O resto do jogo só é visível se não for Game Over, ou fica por baixo */}
            <div className="absolute top-4 right-4 font-mono text-sm md:text-lg font-bold text-gray-800 flex flex-col items-end z-40 bg-white/70 p-2 rounded-md shadow-md">
                <span>JOGADOR: {username}</span>
                <span>PONTOS: {Math.floor(score)}</span>
            </div>

            <div
                className={`absolute`}
                style={{
                    width: `${DINO_WIDTH}px`, height: `${DINO_HEIGHT}px`,
                    bottom: `${GROUND_HEIGHT_PX + dinoY}px`, left: `${DINO_INITIAL_LEFT_PX}px`,
                }}
            >
                <Image src={DINO_IMAGE_PATH} alt="Dino" layout="fill" objectFit="contain" unoptimized />
            </div>

            {obstacles.map(obstacle => (
                <div
                    key={obstacle.id}
                    className={`absolute`}
                    style={{
                        width: `${OBSTACLE_WIDTH}px`, height: `${OBSTACLE_HEIGHT}px`,
                        left: `${obstacle.x}px`, bottom: `${GROUND_HEIGHT_PX}px`,
                    }}
                >
                    <Image src={OBSTACLE_IMAGE_PATH} alt="Obstacle" layout="fill" objectFit="contain" unoptimized />
                </div>
            ))}

            <div
                className="w-full h-[2px] bg-gray-800 absolute left-0"
                style={{ bottom: `${GROUND_HEIGHT_PX - 2}px` }}
            ></div>
        </div>
    );
});
Game.displayName = 'Game';
export default Game;