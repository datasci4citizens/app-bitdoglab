import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div className='bg-gradient-to-bl from-pink-30 to-blue-30 h-screen flex flex-col items-center justify-center gap-6 px-4'>
            <h2 className='text-ubuntu font-bold text-lg px-4 py-2 text-center text-white'>
                Olá! Seja bem vindo ao
            </h2>
            
            <h1 className='text-ubuntu text-5xl font-bold text-center'>
                <span className='text-blue-500'>Bit</span>
                <span className='text-pink-500'>Dog</span>
                <span className='text-black'>Lab</span>
            </h1>
            
            <h2 className='text-ubuntu font-medium text-lg px-4 py-2 text-center text-white'>
                Venha traçar uma jornada de aprendizado e de criatividade
            </h2>
            
            <Button onClick={() => navigate('/connection')} className='mt-4'>
                Começar
            </Button>
        </div>
    );
}