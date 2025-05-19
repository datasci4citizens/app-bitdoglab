import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import lampada from "@/assets/imgs/lampada.png";
import bluetooth from "@/assets/imgs/bluetooth.png";
import touch from "@/assets/imgs/touch.png";
import LED from "../../../public/assets/LED.svg";

export default function NeopixelInfo() {
  const navigate = useNavigate();
  return (
    <>
      <div className="absolute top-5 left-5">
        <Button variant="blue" onClick={() => navigate("/components/neopixel")}>
          Voltar
        </Button>
      </div>

      <div className="h-screen flex flex-col items-center justify-center gap-3.5">
        <img src={lampada} alt="imagem lampada" className="w-1/10 mb-4" />
        <h1 className="text-ubuntu font-bold text-lg">Como funciona?</h1>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center p-4 border-2 border-gray-300 rounded-lg shadow-md w-80 h-24">
            <div
              className="w-12 aspect-square bg-black mask mask-center mask-no-repeat mask-contain"
              style={{
                WebkitMaskImage: `url(${LED})`,
                maskImage: `url(${LED})`,
              }}
            />
            <p className="font-medium font-ubuntu text-md text-center flex-1">
              Usuário toca no LED(x,y)
            </p>
          </div>

          <div className="flex items-center p-4 border-2 border-gray-300 rounded-lg shadow-md w-80 h-24">
            <img src={touch} alt="imagem touch" className="w-1/6 h-auto" />
            <p className="font-medium font-ubuntu text-md text-center flex-1">
              Seleciona uma cor
            </p>
          </div>

          <div className="flex items-center p-4 border-2 border-gray-300 rounded-lg shadow-md w-80 h-24">
            <Button>Enviar</Button>
            <p className="font-medium font-ubuntu text-md text-center flex-1 mr-4">
              Clica em "Enviar"
            </p>
          </div>

          <div className="flex items-center p-4 border-2 border-gray-300 rounded-lg shadow-md w-80 h-24">
            <img
              src={bluetooth}
              alt="imagem bluetooth"
              className="w-1/6 h-auto"
            />
            <p className="font-medium font-ubuntu text-md text-center flex-1">
              Placa recebe via Bluetooth
            </p>
          </div>

          <div className="flex items-center p-4 border-2 border-gray-300 rounded-lg shadow-md w-80 h-24">
            <div
              className="w-12 aspect-square bg-gradient-to-bl from-pink-30 to-blue-30
               mask mask-center mask-no-repeat mask-contain"
              style={{
                WebkitMaskImage: `url(${LED})`,
                maskImage: `url(${LED})`,
              }}
            />
            <p className="font-medium font-ubuntu text-md text-center flex-1">
              LED(x,y) muda para a cor selecionada
            </p>
          </div>
        </div>
        <Button className="mt-2" onClick={() => navigate("/components/neopixel/rgb-info")}>
          Como funciona o RGB?
        </Button>
      </div>
    </>
  );
}
