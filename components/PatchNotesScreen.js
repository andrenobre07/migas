// components/PatchNotesScreen.js (NOVO FICHEIRO)

import React from 'react';

// --- EDITAR AQUI ---
// Para adicionar novas atualizações, basta adicionar um novo objeto ao início da lista "patchNotesData".
const patchNotesData = [
    
 {
        version: "1.3.0",
        date: "09/08/2025",
        notes: [
            "Leaderboard reset",
            "Skins adicionada",
        ]
    },
    
    {
        version: "1.4.0",
        date: "10/08/2025",
        notes: [
            "Patchnotes adicionado",
            "Skin -Migas benfiquista- adicionada",
        ]
    },
  
];
// --------------------

const PatchNotesScreen = ({ onBack }) => {
    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-left">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Notas da Atualização</h1>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                {patchNotesData.map((patch) => (
                    <div key={patch.version} className="border-b pb-4 last:border-b-0">
                        <h2 className="text-2xl font-semibold text-gray-700">Versão {patch.version}</h2>
                        <p className="text-sm text-gray-500 mb-2">{patch.date}</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {patch.notes.map((note, index) => (
                                <li key={index}>{note}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8">
                <button
                    onClick={onBack}
                    className="w-full max-w-xs mx-auto px-6 py-3 text-lg text-white bg-gray-500 rounded-md cursor-pointer transition-colors hover:bg-gray-600"
                >
                    Voltar
                </button>
            </div>
        </div>
    );
};

export default PatchNotesScreen;