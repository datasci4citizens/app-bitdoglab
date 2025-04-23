import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import LedRGB from "./pages/LedRGB";
import BuzzersGravar from "./pages/BuzzersGravar";
import BuzzersTocar from "./pages/BuzzersTocar";
import { SerialProvider } from "./contexts/SerialContext";

export function App() {
  return (
    <SerialProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/connection" element={<Connection />} />
          <Route path="/components" element={<Components />} />
          <Route path="/botoes" element={<Botoes />} />
          <Route path="/buzzers" element={<Buzzers />} />
          <Route path="/buzzersGravar" element={<BuzzersGravar />} />
          <Route path="/buzzersTocar" element={<BuzzersTocar />} />
          <Route path="/microfone" element={<Microfone />} />
          <Route path="/display" element={<Display />} />
          <Route path="/joystick" element={<Joystick />} />
          <Route path="/neopixel" element={<Neopixel />} />
          <Route path="/ledrgb" element={<LedRGB />} />
        </Routes>
      </BrowserRouter>
    </SerialProvider>
  );
}
