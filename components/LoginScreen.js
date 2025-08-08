import React from 'react';

const LoginScreen = ({ username, setUsername, onPlay, onShowLeaderboard }) => {
  const isButtonDisabled = username.trim().length < 3;

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Jogo do Migas</h1>
      <div className="mb-4">
        <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
          Insere o teu nome de utilizador (mín. 3 letras)
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="O teu nome"
          maxLength={15}
        />
      </div>
      <div className="flex flex-col space-y-4">
        <button
          onClick={onPlay}
          disabled={isButtonDisabled}
          className={`w-full px-6 py-3 text-lg text-white rounded-md cursor-pointer transition-colors ${
            isButtonDisabled 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          Jogar
        </button>
        <button
          onClick={onShowLeaderboard}
          className="w-full px-6 py-3 text-lg text-white bg-blue-500 rounded-md cursor-pointer transition-colors hover:bg-blue-600"
        >
          Leaderboard
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;