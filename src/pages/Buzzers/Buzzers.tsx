import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Buzzers() {
    const navigate = useNavigate();

    return (
    <>
      <div className="absolute top-5 left-5">
        <Button variant="blue" onClick={() => navigate('/components')}>
          Voltar
        </Button>
      </div>

      <div className="h-screen flex flex-col items-center justify-center gap-3.5">
        <h1 className="text-ubuntu font-medium text-lg">Buzzers</h1>
        <Button onClick={() => navigate('/components/buzzers/buzzersTocar')}>Tocar em tempo real</Button>
        <Button onClick={() => navigate('/components/buzzers/buzzersGravar')}>Gravar uma musica</Button>
      </div>
    </>
  );
}