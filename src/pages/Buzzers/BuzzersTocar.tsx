import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';


export default function Buzzers() {
    const navigate = useNavigate();
    const hasRun = useRef(false);
    const wrapperRefs = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        fetch("../src/pages/testandoTeclado.svg")
            .then(res => res.text())
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
                const svg = svgDoc.querySelector('svg');

                if (!svg) return;

                svg.setAttribute('id', "teclado");
                svg.classList.add('teclado-svg');

                wrapperRefs.current!.innerHTML = '';
                wrapperRefs.current!.appendChild(svg);
            });
    })

    return (
    <div className='h-screen flex flex-col items-center justify-center gap-3.5'>
        <h1>Buzzers</h1>
        <h3>Escolha uma nota e seu tom</h3>
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
        <div id="teclado" ref={wrapperRefs}></div>
    <Button onClick={() => navigate('/components/buzzers')}>Voltar</Button>
    </div>
    );
}