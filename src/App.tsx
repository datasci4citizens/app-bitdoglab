import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConnectionProvider } from "./contexts/ConnectionContext";

import SplashScreen from "./pages/SplashScreen";
import Welcome from "./pages/Welcome";
import Connection from "./pages/Connection";
import Components from "./pages/Components";
import Botoes from "./pages/Buttons/Buttons";
import Buzzers from "./pages/Buzzers/Buzzers";
import Microfone from "./pages/Microphone/Microphone";
import Display from "./pages/Display/Display";
import Joystick from "./pages/Joystick/Joystick";
import Neopixel from "./pages/Neopixel/Neopixel";
import NeopixelInfo from "./pages/Neopixel/NeopixelInfo";
import LedRGB from "./pages/LedRGB/LedRGB";
import BuzzersGravar from "./pages/Buzzers/BuzzersGravar";
import BuzzersTocar from "./pages/Buzzers/BuzzersTocar";
import RGBInfo from "./pages/Neopixel/RGBInfo";
import NotFound from "./pages/NotFound";
import { ConnectionStatus } from "./components/ConnectionStatus"; // Adjusted path to match file naming conventions
import './pages/style.css'

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
          <Route path="/components/neopixel/info" element={<NeopixelInfo />} />
          <Route path="/components/neopixel/rgb-info" element={<RGBInfo />} />
          <Route path="/components/ledrgb" element={<LedRGB />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ConnectionProvider>
  );
}
