import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import './style.css'
import { useEffect, useRef, useState } from 'react';

export default function Neopixel() {
    const navigate = useNavigate();
    const hasRun = useRef(false);

    const wrapperRefs = useRef<HTMLDivElement>(null);
    const wrapperRefs2 = useRef<HTMLDivElement>(null);
    const wrapperRefs3 = useRef<HTMLDivElement>(null);
    const wrapperRefs4 = useRef<HTMLDivElement>(null);
    const wrapperRefs5 = useRef<HTMLDivElement>(null);

    const rRef = useRef<HTMLInputElement>(null);
    const gRef = useRef<HTMLInputElement>(null);
    const bRef = useRef<HTMLInputElement>(null);

    const [ledSelecionado, setLedSelecionado] = useState<Element | null>(null);

    function loadLed(container: HTMLDivElement | null, ledId: string) {
        fetch("../src/pages/LED.svg")
            .then(res => res.text())
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
                const svg = svgDoc.querySelector('svg');
                const rect = svg?.querySelector('#led');

                if (!svg || !rect) return;

                svg.setAttribute('id', ledId);
                svg.classList.add('led-svg');

                const ledContainer = document.createElement('div');
                ledContainer.classList.add('led-container');
                ledContainer.appendChild(svg);

                svg.addEventListener('click', () => {
                    document.querySelectorAll('.led-container').forEach(c => {
                        (c as HTMLElement).style.border = 'none';
                    });
                    (ledContainer as HTMLElement).style.border = '2px solid red';
                    setLedSelecionado(rect);
                    updateLEDColor();
                });

                if (container) {
                    container.appendChild(ledContainer);
                }
            });
    }

    // Atualiza a cor do LED selecionado
    function updateLEDColor() {
        if (!ledSelecionado || !rRef.current || !gRef.current || !bRef.current) return;

        const r = rRef.current.defaultValue;
        const g = gRef.current.defaultValue;
        const b = bRef.current.defaultValue;
        const rgbColor = `rgb(${r}, ${g}, ${b})`;

        ledSelecionado.setAttribute('fill', rgbColor);
        ledSelecionado.setAttribute('text', 'on');
    }

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        alert('Paparelepipedo');
        // Cria os LEDs
        loadLed(wrapperRefs.current, 'led1');
        loadLed(wrapperRefs.current, 'led3');
        loadLed(wrapperRefs.current, 'led4');
        loadLed(wrapperRefs.current, 'led2');
        loadLed(wrapperRefs.current, 'led5');

        loadLed(wrapperRefs2.current, 'led6');
        loadLed(wrapperRefs2.current, 'led7');
        loadLed(wrapperRefs2.current, 'led8');
        loadLed(wrapperRefs2.current, 'led9');
        loadLed(wrapperRefs2.current, 'led10');

        loadLed(wrapperRefs3.current, 'led11');
        loadLed(wrapperRefs3.current, 'led12');
        loadLed(wrapperRefs3.current, 'led13');
        loadLed(wrapperRefs3.current, 'led14');
        loadLed(wrapperRefs3.current, 'led15');

        loadLed(wrapperRefs4.current, 'led16');
        loadLed(wrapperRefs4.current, 'led17');
        loadLed(wrapperRefs4.current, 'led18');
        loadLed(wrapperRefs4.current, 'led19');
        loadLed(wrapperRefs4.current, 'led20');

        loadLed(wrapperRefs5.current, 'led21');
        loadLed(wrapperRefs5.current, 'led22');
        loadLed(wrapperRefs5.current, 'led23');
        loadLed(wrapperRefs5.current, 'led24');
        loadLed(wrapperRefs5.current, 'led25');

        const limparBtn = document.getElementById("limpar");
        const enviarBtn = document.getElementById("enviar");

        limparBtn?.addEventListener("click", () => {
            const leds = document.querySelectorAll('svg #led');
            leds.forEach((led) => {
                led.setAttribute('fill', 'rgb(0, 0, 0)');
                led.setAttribute('text', 'off');
            });
        });

        enviarBtn?.addEventListener("click", () => {
            const leds = document.querySelectorAll('svg');
            const dados: any[] = [];

            leds.forEach(svg => {
                const id = svg.getAttribute('id');
                const ledRect = svg.querySelector('#led');

                if (ledRect) {
                    const cor = ledRect.getAttribute('fill');
                    const text = ledRect.getAttribute('text');
                    dados.push({ id, cor, text });
                }
            });

            const json = JSON.stringify(dados, null, 3);
            const blob = new Blob([json], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'infoLEDs.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        rRef.current?.addEventListener('input', updateLEDColor);
        gRef.current?.addEventListener('input', updateLEDColor);
        bRef.current?.addEventListener('input', updateLEDColor);
    }, []);

    return (
        <><h1>Neopixel</h1>
        <h2>Selecione um dos 25 LEDS e regule a cor conforme desejar</h2>

        <div id="leds-wrapper" ref={wrapperRefs}></div>
        <div id="leds-wrapper2" ref={wrapperRefs2}></div>
        <div id="leds-wrapper3" ref={wrapperRefs3}></div>
        <div id="leds-wrapper4" ref={wrapperRefs4}></div>
        <div id="leds-wrapper5" ref={wrapperRefs5}></div>

        <div className="slider-container">
            <label>R:
                <input type="range" id="rSlider" min="0" max="255" defaultValue="0"></input>
                <span id="rValueDisplay">0</span>
            </label>
        </div>
        <div className="slider-container">
            <label>G:
                <input type="range" id="gSlider" min="0" max="255" defaultValue="0"></input>
                <span id="gValueDisplay">0</span>
            </label>
        </div>
        <div className="slider-container">
            <label>B:
                <input type="range" id="bSlider" min="0" max="255" defaultValue="0"></input>
                <span id="bValueDisplay">0</span>
            </label>
        </div>
        <Button id="limpar">Limpar</Button><Button id="enviar">Enviar</Button><Button onClick={() => navigate('/components')}>Voltar</Button>
        </>

    );
}