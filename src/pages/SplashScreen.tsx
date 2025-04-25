import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/imgs/logoEscola4.png';
// Depois use: <img src={logo} alt="Logo" />


export default function SplashScreen() {

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/welcome'); // muda para a tela de boas-vindas
        }, 2000);

        return () => clearTimeout(timer); // limpa o timer se sair da tela
    }, [navigate]);

    return (
    <div className='bg-gradient-to-bl from-pink-30 to-blue-30 h-screen flex flex-col items-center justify-center'>
        <img 
            src={logo} 
            alt="Logo Escola 4.0"
            className="w-1/2 mb-4"
        />
        <h1 className='font-ubuntu text-xl font-bold text-white'>Escola 4.0</h1>
    </div>
    );
}