import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Buzzers() {
    const navigate = useNavigate();

    return (
    <div className='h-screen flex flex-col items-center justify-center gap-3.5'>
        <h1 className='text-ubuntu font-medium text-lg'>Buzzers</h1>
        <h3 className='text-ubuntu font-regular text-md'>Selecione as notas e toque</h3>
        <div id="escala">
            <h5 className='textInLine'>1</h5>
            <h5 className='textInLine'>2</h5>
            <h5 className='textInLine'>3</h5>
            <h5 className='textInLine'>4</h5>
            <h5 className='textInLine'>5</h5>
            <h5 className='textInLine'>6</h5>
            <h5 className='textInLine'>7</h5>
        </div>
        <div className="slider-container">
            <label> Grave
                <input type="range" id="tomSlider" min="1" max="7" ></input>
                Agudo
            </label>
        </div>
    <Button onClick={() => navigate('/components/buzzers')}>Voltar</Button>
    </div>
    );
}