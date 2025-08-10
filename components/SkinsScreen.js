// components/SkinsScreen.js (NOVO FICHEIRO)

import React from 'react';
import Image from 'next/image';

// Define aqui as tuas skins. Certifica-te que os caminhos das imagens estão corretos!
const availableSkins = [
    { id: 'default', name: 'Migas Nazi ', imagePath: '/images/dino.png' },
    { id: 'red', name: 'Migas Chapeu', imagePath: '/images/dino1.png' },
    { id: 'blue', name: 'Migas Casa de Papel', imagePath: '/images/dino2.png' },
    { id: 'gold', name: 'Migas sybau', imagePath: '/images/dino3.png' },
    { id: 'matrix', name: 'Migas ice tea', imagePath: '/images/dino4.png' },
     { id: 'anos', name: 'Migas jeitoso', imagePath: '/images/dino5.png' },
       { id: 'aids', name: 'Migas com ebola', imagePath: '/images/dino6.png' },
       { id: 'benfica', name: 'Migas benfiquista', imagePath: '/images/dino7.png' },
];

const SkinsScreen = ({ currentSkin, onSelectSkin, onBack }) => {
    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Escolhe a tua Skin</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
                {availableSkins.map((skin) => (
                    <div 
                        key={skin.id} 
                        onClick={() => onSelectSkin(skin.imagePath)}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                            currentSkin === skin.imagePath 
                                ? 'bg-green-200 border-4 border-green-500 transform scale-110' 
                                : 'bg-gray-100 border-4 border-transparent hover:bg-gray-200'
                        }`}
                    >
                        <div className="w-full h-24 relative">
                            <Image src={skin.imagePath} alt={skin.name} layout="fill" objectFit="contain" unoptimized />
                        </div>
                        <p className="mt-2 text-sm font-semibold text-gray-700">{skin.name}</p>
                    </div>
                ))}
            </div>

            <button
                onClick={onBack}
                className="w-full max-w-xs mx-auto px-6 py-3 text-lg text-white bg-gray-500 rounded-md cursor-pointer transition-colors hover:bg-gray-600"
            >
                Voltar
            </button>
        </div>
    );
};

export default SkinsScreen;