import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useButtons } from "@/hooks/useButtons";
import { useConnection } from "@/connection/ConnectionContext";
import DropdownSelector from "@/components/DropdownSelector";
import Selecter from "@/components/Selecter";
import LED from "@/components/LED";
import ColorPicker from "@/components/ColorPicker";
import Slider from "@/components/Slider";
import Cards from "@/components/Cards";
import bigx from "@/assets/imgs/BigX.png";
import smalx from "@/assets/imgs/SmalX.png";
import bigheart from "@/assets/imgs/BigHeart.png";
import smalheart from "@/assets/imgs/SmalHeart.png";
import smilley from "@/assets/imgs/Smiley.png";
import sad from "@/assets/imgs/Sad.png";
import giraffe from "@/assets/imgs/Giraffe.png";
import PopUp from "@/components/PopUp";

export default function Buttons() {
  const { sendCommand } = useConnection();

  const cardscomponents = [
    { id: "bigx", icon: <img src={bigx} alt="imagem bigx"/>, text: "X grande"},
    { id: "smalx", icon: <img src={smalx} alt="imagem smalx"/>, text: "X pequeno"},
    { id: "bigheart", icon: <img src={bigheart} alt="imagem bigheart"/>, text: "Coração grande"},
    { id: "smalheart", icon: <img src={smalheart} alt="imagem smalheart"/>, text: "Coração pequeno"},
    { id: "smilley", icon: <img src={smilley} alt="imagem smilley"/>, text: "Carinha feliz"},
    { id: "sad", icon: <img src={sad} alt="imagem sad"/>, text: "Carinha triste"},
    { id: "giraffe", icon: <img src={giraffe} alt="imagem giraffe"/>, text: "Girafa"}
  ];

  const buttonscomponents = [
    { id: "botaoa", label: "Botão A" },
    { id: "botaob", label: "Botão B" }
  ]

  const components = [
    { id: "neopixel", label: "Neopixel Personalizado" },
    { id: "ledrgb", label: "LED RGB" },
    { id: "buzzera", label: "Buzzer A" },
    { id: "buzzerb", label: "Buzzer B" }
  ];

  const {
    // State
    selectedComponent,
    selectedButton,
    selectedCard,
    popup,
    valueN,
    valueV,

    // LED RGB values
    valueR,
    valueG,
    valueB,
    currentColor,
    
    // Setters
    setSelectedComponent,
    setSelectedButton,
    setSelectedCard,
    onChangeN,
    onChangeV,
    setValueR,
    setValueG,
    setValueB,
    
    // Handlers
    closePopup,
    handleClear,
    handleSend
  } = useButtons(sendCommand);

  const renderDynamicContent = () => {
    if (selectedComponent === "neopixel") {
      return (
        <div>
          <Cards
            cards={cardscomponents}
            onSelect={setSelectedCard}
            value={selectedCard}
          />
          {/* Botões de ação */}
          <div className='flex flex-row justify-center gap-3 mt-3'>
            <Button variant="secondary" onClick={handleSend}>Enviar</Button>
          </div>
        </div>
      );
    }
    
    if (selectedComponent === "ledrgb") {
      return (
        <div className="h-screen flex flex-col items-center gap-2">
          <div className="mb-4">
            <LED 
              id="single-led" 
              color={currentColor}
              selected={false}
              size='lg'
            />
          </div>
          
          {/* ColorPicker para ajustar os valores RGB */}
          <ColorPicker
            valueR={valueR}
            valueG={valueG}
            valueB={valueB}
            onChangeR={setValueR}
            onChangeG={setValueG}
            onChangeB={setValueB}
            showLabels={true}
            showValues={true}
          />
          
          {/* Botões de ação */}
          <div className='flex flex-row justify-center gap-3 mt-3'>
            <Button variant="whiteSecondary" onClick={handleClear}>Limpar</Button>
            <Button variant="secondary" onClick={handleSend}>Enviar</Button>
          </div>
        </div>
      );
    }
    
    if (selectedComponent === "buzzera" || selectedComponent === "buzzerb") {
      return (
        <div className="mt-6 p-4 rounded-lg items-center">
          <Slider 
            variant="numeric" 
            value={valueN} 
            onChange={onChangeN}
            label={true ? 'Hz' : undefined}
            showValue={true}
            width='w-250'
            min={0}
            max={5000}
          />
          <Slider 
            variant="volume" 
            value={valueV} 
            onChange={onChangeV}
            label={true ? 'Vol' : undefined}
            showValue={true}
            width='w-250'
            min={0}
            max={100}
          />
          {/* Botões de ação */}
          <div className='flex flex-row justify-center gap-3 mt-3'>
            <Button variant="whiteSecondary" onClick={handleClear}>Limpar</Button>
            <Button variant="secondary" onClick={handleSend}>Enviar</Button>
          </div>
        </div>
      );
    }
    
    // Default case - quando nenhuma opção válida é selecionada
    return (
      <div className="mt-6 p-4 text-center">
        <p className="text-text">Selecione uma opção acima para ver o conteúdo</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header 
        title="Botões" 
        showIdeaButton={true}
        ideaButtonPath="/components/botoes/info" 
      />
      <main className="h-screen flex flex-col items-center gap-2">
        <h2 className="text-ubuntu text-md mb-5 text-center pr-5 text-heading">
          Escolha um  botão e defina o que ele faz quando for pressionado
        </h2>
        <Selecter
          options={buttonscomponents}
          onSelect={setSelectedButton}
          value={selectedButton}
        />
        <DropdownSelector
          options={components}
          placeholder="Selecione um componente"
          onSelect={setSelectedComponent}
          value={selectedComponent}
        />
        <PopUp
          isOpen={popup.isOpen}
          onClose={closePopup}
          message={popup.message}
        />

        {/* Conteúdo Dinâmico */}
        {renderDynamicContent()}
      </main>
    </div>
  );
}