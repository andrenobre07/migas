import Game from '../components/Game';
import { Analytics } from "@vercel/analytics/next"

export default function HomePage() {
  return (
    // --- ALTERAÇÃO: Garantir que o layout funciona bem em ecrãs de todas as alturas ---
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-200">
      
      {/* O componente do Jogo */}
      <Game />

    </main>
    // --- ALTERAÇÃO FIM ---
  );
}