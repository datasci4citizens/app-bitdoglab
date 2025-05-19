import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import bitdog from "../assets/imgs/bitdog-fav-1.png";

export default function Components() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <img
        src={bitdog}
        alt="imagem BitDog"
        className="w-1/2 md:w-1/3 lg:w-1/4 max-w-xs mb-4"
      />
      <h1 className="text-ubuntu font-medium text-lg">
        Qual componente você quer explorar?
      </h1>
      <div className="flex flex-wrap justify-center gap-4 w-full max-w-md px-8">
        <Button
          className="flex-1 min-w-[calc(50%-0.5rem)]"
          onClick={() => navigate("/components/botoes")}
        >
          Botões
        </Button>
        <Button
          className="flex-1 min-w-[calc(50%-0.5rem)]"
          onClick={() => navigate("/components/buzzers")}
        >
          Buzzers
        </Button>
        <Button
          className="flex-1 min-w-[calc(50%-0.5rem)]"
          onClick={() => navigate("/components/microfone")}
        >
          Microfone
        </Button>
        <Button
          className="flex-1 min-w-[calc(50%-0.5rem)]"
          onClick={() => navigate("/components/display")}
        >
          Display
        </Button>
        <Button
          className="flex-1 min-w-[calc(50%-0.5rem)]"
          onClick={() => navigate("/components/joystick")}
        >
          JoyStick
        </Button>
        <Button
          className="flex-1 min-w-[calc(50%-0.5rem)]"
          onClick={() => navigate("/components/neopixel")}
        >
          NeoPixel
        </Button>
        <Button
          className="flex-1 min-w-[calc(50%-0.5rem)]"
          onClick={() => navigate("/components/ledrgb")}
        >
          Led RGB
        </Button>
      </div>
    </div>
  );
}
