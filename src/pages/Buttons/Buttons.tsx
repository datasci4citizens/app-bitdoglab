import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Buttons() {
    const navigate = useNavigate();

    return (
        <>
        <div className="absolute top-5 left-5">
          <Button variant="blue" onClick={() => navigate('/components')}>
            Voltar
          </Button>
        </div>
  
        <div className="h-screen flex flex-col items-center justify-center gap-3.5">
          <h1 className="text-ubuntu font-medium text-lg">Botões</h1>
          
        </div>
      </>
    );
}