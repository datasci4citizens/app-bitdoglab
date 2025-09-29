import { Header } from "@/components/Header";
import { Button } from '@/components/ui/button';

/**
 * Jogo - Um componente para rodar o jogo da placa
 * 
 * @returns {JSX.Element} - O componente Jogo renderizado
 */
export default function Jogo() {
  // Função para atualizar a placa
  const handleSend = async () => {
    
  };

  return (
    <>
      <Header
        title="Jogo"
        showIdeaButton={false}
      />
      <div className="h-screen flex flex-col items-center gap-5 bg-background">
        <h2 className="text-ubuntu font-medium text-md mb-10 text-heading mx-4">
          Aqui você pode testar um joguinho na placa, só clicar no play
        </h2>
        
        {/* Botões de ação */}
        <div className='flex flex-row justify-center gap-3 mt-3'>
          <Button variant="secondary" onClick={handleSend}>Play</Button>
        </div>
      </div>
    </>
  );
}