import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

// --- CONFIGURAÇÕES GLOBAIS - Mude aqui para alterar o jogo ---
// Caminhos dos assets
const DINO_IMAGE_PATH = '/images/dino.png';
const OBSTACLE_IMAGE_PATH = '/images/cactus.png';
const GAMEOVER_IMAGE_PATH = '/images/gameover.png';

const BACKGROUND_AUDIO_PATH = '/audio/background.mp3';
const JUMP_AUDIO_PATH = '/audio/jump.mp3';
const HIT_AUDIO_PATH = '/audio/hit.mp3';

// Parâmetros do Jogo
const GAME_SPEED_START = 8;
const GAME_SPEED_INCREMENT = 0.003;

const DINO_JUMP_FORCE = 16;
const GRAVITY = 0.7;
const OBSTACLE_INTERVAL_MIN = 800;
const OBSTACLE_INTERVAL_MAX = 2000;

// Constantes de Posição (para usar com Tailwind)
const GROUND_HEIGHT_PX = 40;
const DINO_INITIAL_LEFT_PX = 50;
// -----------------------------------------------------------------

const Game = () => {
  // Estados do Jogo
  const [isPlaying, setIsPlaying] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Posições
  const [dinoY, setDinoY] = useState(0);
  const [dinoVelocityY, setDinoVelocityY] = useState(0);
  const [obstacles, setObstacles] = useState([]);

  // Refs
  const gameContainerRef = useRef(null);
  const dinoRef = useRef(null);
  const gameLoopRef = useRef();
  const gameSpeedRef = useRef(GAME_SPEED_START);
  const obstacleTimerRef = useRef();
  
  const gameStateRef = useRef({ score, highScore });
  useEffect(() => {
    gameStateRef.current = { score, highScore };
  }, [score, highScore]);

  const audioRefs = {
    background: useRef(null),
    jump: useRef(null),
    hit: useRef(null),
  };

  useEffect(() => {
    const savedHighScore = localStorage.getItem('dinoHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    if (typeof window !== 'undefined') {
        audioRefs.background.current = new Audio(BACKGROUND_AUDIO_PATH);
        audioRefs.background.current.loop = true;
        audioRefs.jump.current = new Audio(JUMP_AUDIO_PATH);
        audioRefs.hit.current = new Audio(HIT_AUDIO_PATH);
    }
  }, []);

  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(true);
    cancelAnimationFrame(gameLoopRef.current);
    clearTimeout(obstacleTimerRef.current);

    audioRefs.background.current?.pause();
    audioRefs.hit.current?.play();

    const finalScore = Math.floor(gameStateRef.current.score);
    if (finalScore > gameStateRef.current.highScore) {
      setHighScore(finalScore);
      localStorage.setItem('dinoHighScore', finalScore.toString());
    }
  }, []); 

  const startObstacleGenerator = () => {
    const generateObstacle = () => {
      if (!isGameOverRef.current && isPlayingRef.current) {
          setObstacles(prev => [...prev, { x: gameContainerRef.current?.offsetWidth || 800, id: Date.now() }]);
          const nextInterval = Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN) + OBSTACLE_INTERVAL_MIN;
          obstacleTimerRef.current = setTimeout(generateObstacle, nextInterval);
      }
    }
    generateObstacle();
  }
  
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const isGameOverRef = useRef(isGameOver);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);

  // --- ALTERAÇÃO INÍCIO: A chamada ao startObstacleGenerator foi movida daqui... ---
  const handleStartGame = useCallback(() => {
    setIsGameOver(false);
    setScore(0);
    setDinoY(0);
    setDinoVelocityY(0);
    setObstacles([]);
    gameSpeedRef.current = GAME_SPEED_START;
    
    setIsPlaying(true); 

    audioRefs.background.current?.play().catch(e => console.error("Erro ao tocar música de fundo:", e));
    
    // A chamada a startObstacleGenerator() foi REMOVIDA daqui.
  }, []);
  // --- ALTERAÇÃO FIM ---

  const gameLoop = useCallback(() => {
    if (!isPlayingRef.current || isGameOverRef.current) {
      return;
    }

    setDinoY(y => {
      const newVelocity = dinoVelocityYRef.current - GRAVITY;
      setDinoVelocityY(newVelocity); 
      
      const newY = y + newVelocity;
      if (newY <= 0) {
        setIsJumping(false);
        return 0;
      }
      return newY;
    });

    setObstacles(prevObstacles =>
      prevObstacles
        .map(obstacle => ({ ...obstacle, x: obstacle.x - gameSpeedRef.current }))
        .filter(obstacle => obstacle.x > -50)
    );

    setScore(s => s + 1);
    gameSpeedRef.current += GAME_SPEED_INCREMENT;
    
    if (dinoRef.current) {
      const dinoRect = dinoRef.current.getBoundingClientRect();
      const obstacleElements = document.querySelectorAll('.obstacle-element');
      for (const obstacleEl of Array.from(obstacleElements)) {
        const obstacleRect = obstacleEl.getBoundingClientRect();
        if (
          dinoRect.right > obstacleRect.left &&
          dinoRect.left < obstacleRect.right &&
          dinoRect.bottom > obstacleRect.top &&
          dinoRect.top < obstacleRect.bottom
        ) {
          handleGameOver();
          return;
        }
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [handleGameOver]);
  
  const dinoVelocityYRef = useRef(dinoVelocityY);
  useEffect(() => { dinoVelocityYRef.current = dinoVelocityY; }, [dinoVelocityY]);

  // --- ALTERAÇÃO INÍCIO: ...e colocada aqui, onde é mais seguro! ---
  useEffect(() => {
    if (isPlaying) {
      // Inicia o loop do jogo
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      // Inicia o gerador de obstáculos
      startObstacleGenerator();
    } else {
      // Limpa tudo quando o jogo para
      cancelAnimationFrame(gameLoopRef.current);
      clearTimeout(obstacleTimerRef.current);
    }

    // Função de limpeza para desmontar o componente
    return () => {
        cancelAnimationFrame(gameLoopRef.current);
        clearTimeout(obstacleTimerRef.current);
    }
  }, [isPlaying, gameLoop]);
  // --- ALTERAÇÃO FIM ---

  const handleJump = useCallback(() => {
    if (isPlaying && !isJumping) {
      setIsJumping(true);
      setDinoVelocityY(DINO_JUMP_FORCE);
      audioRefs.jump.current?.play();
    }
  }, [isPlaying, isJumping]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!isPlayingRef.current && !isGameOverRef.current) {
          handleStartGame();
        } else if (isGameOverRef.current) {
            handleStartGame();
        } else {
          handleJump();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump, handleStartGame]);

  return (
    <div 
      className="w-[800px] h-[400px] border-2 border-gray-800 relative overflow-hidden bg-gray-100 mx-auto my-5" 
      ref={gameContainerRef} 
      tabIndex={0}
      onKeyDown={(e) => {
        if(isGameOver && (e.code === 'Space' || e.code === 'ArrowUp')) handleStartGame();
      }}
      onClick={() => {
        if (!isPlaying && !isGameOver) handleStartGame();
        else if(isGameOver) handleStartGame();
        else handleJump();
      }}
    >
      <div className="absolute top-2.5 right-2.5 font-mono text-lg font-bold text-gray-600 flex flex-col items-end z-20">
        <span>PONTOS: {Math.floor(score)}</span>
        <span>RECORDE: {Math.floor(highScore)}</span>
      </div>

      {!isPlaying && !isGameOver && (
        <div className="w-full h-full flex flex-col justify-center items-center bg-gray-100/80 text-gray-800 text-center z-10">
          <h1 className="text-4xl mb-5 font-bold">Jogo do Migas</h1>
          <button 
            onClick={(e) => { e.stopPropagation(); handleStartGame(); }} // Adicionado stopPropagation para evitar que o clique no botão também chame o onClick do div pai
            className="px-6 py-3 text-lg text-white bg-gray-800 rounded-md cursor-pointer transition-colors hover:bg-gray-700"
          >
            Iniciar Jogo
          </button>
          <p className="mt-5 text-gray-500">Pressione Espaço ou Clique para começar e para pular</p>
        </div>
      )}

      {isGameOver && (
        <div className="w-full h-full flex flex-col justify-center items-center bg-gray-100/80 text-gray-800 text-center z-10">
          <Image src={GAMEOVER_IMAGE_PATH} alt="Game Over" width={200} height={100} unoptimized />
          <h2 className="text-4xl mt-4 mb-2 font-bold">Fim de Jogo</h2>
          <p className="mb-4 text-lg">Seu recorde máximo: {Math.floor(highScore)}</p>
          <button 
            onClick={(e) => { e.stopPropagation(); handleStartGame(); }} // Adicionado stopPropagation
            className="px-6 py-3 text-lg text-white bg-gray-800 rounded-md cursor-pointer transition-colors hover:bg-gray-700"
          >
            Tentar Novamente
          </button>
        </div>
      )}
      
      <div 
        className={`w-[50px] h-[50px] absolute`}
        style={{ 
          bottom: `${GROUND_HEIGHT_PX}px`, 
          left: `${DINO_INITIAL_LEFT_PX}px`,
          transform: `translateY(${-dinoY}px)` 
        }}
        ref={dinoRef}
      >
        <Image src={DINO_IMAGE_PATH} alt="Dino" layout="fill" objectFit="contain" unoptimized />
      </div>

      {obstacles.map(obstacle => (
        <div
          key={obstacle.id}
          className={`obstacle-element w-[30px] h-[60px] absolute`} 
          style={{ 
            left: `${obstacle.x}px`,
            bottom: `${GROUND_HEIGHT_PX}px`
          }}
        >
          <Image src={OBSTACLE_IMAGE_PATH} alt="Obstacle" layout="fill" objectFit="contain" unoptimized />
        </div>
      ))}

      <div 
        className="w-full h-[2px] bg-gray-800 absolute left-0"
        style={{ bottom: `${GROUND_HEIGHT_PX}px` }}
      ></div>
    </div>
  );
};

export default Game;