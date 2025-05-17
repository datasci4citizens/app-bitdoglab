import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConnectionProvider } from "./contexts/ConnectionContext";

import SplashScreen from "./pages/SplashScreen";
import Welcome from "./pages/Welcome";
import Connection from "./pages/Connection";
import Components from "./pages/Components";
import Botoes from "./pages/Buttons";
import Buzzers from "./pages/Buzzers";
import Microfone from "./pages/Microphone";
import Display from "./pages/Display";
import Joystick from "./pages/Joystick";
import Neopixel from "./pages/Neopixel";
import IdeaNeopixel from "./pages/IdeaNeopixel";
import LedRGB from "./pages/LedRGB";
import LedRGBOld from "./pages/LedRGBOld";
import BuzzersGravar from "./pages/BuzzersGravar";
import BuzzersTocar from "./pages/BuzzersTocar";
import NotFound from "./pages/NotFound";
import Rgb from "./pages/Rgb";
import { ConnectionStatus } from "./components/ConnectionStatus"; // Adjusted path to match file naming conventions

export function App() {
  return (
    <ConnectionProvider>
      <BrowserRouter>
        <ConnectionStatus />
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/connection" element={<Connection />} />
          <Route path="/components" element={<Components />} />
          <Route path="/components/botoes" element={<Botoes />} />
          <Route path="/components/buzzers" element={<Buzzers />} />
          <Route path="/components/buzzers/buzzersGravar" element={<BuzzersGravar />} />
          <Route path="/components/buzzers/buzzersTocar" element={<BuzzersTocar />} />
          <Route path="/components/microfone" element={<Microfone />} />
          <Route path="/components/display" element={<Display />} />
          <Route path="/components/joystick" element={<Joystick />} />
          <Route path="/components/neopixel" element={<Neopixel />} />
          <Route path="/components/neopixel/como-funciona" element={<IdeaNeopixel />} />
          <Route path="/components/neopixel/rgb" element={<Rgb />} />
          <Route path="/components/ledrgb" element={<LedRGB />} />
          <Route path="/components/ledrgbold" element={<LedRGBOld />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ConnectionProvider>
  );
}
