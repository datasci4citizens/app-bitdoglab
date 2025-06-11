import { useConnection } from "@/contexts/ConnectionContext";
import { Header } from "@/components/Header";
import Slider from "@/components/Slider";
import { useBuzzersTocar } from "@/hooks/useBuzzersTocar";
import Piano from "@/components/Piano";

export default function BuzzersGravar() {
  const { sendCommand } = useConnection();

  const { octave, setOctave, handleNotePress } = useBuzzersTocar(sendCommand);

  return (
    <>
      <Header
        title="Grave uma música"
        showIdeaButton={true}
        ideaButtonPath="/components/buzzers/info"
      />
      <div className="h-screen flex flex-col items-center gap-3.5">
        <h3>Escolha uma nota e seu tom</h3>
        <Slider
          variant="pianoTones"
          value={octave}
          onChange={setOctave}
          showValue={false}
        />
        <Piano onKeyPress={handleNotePress} />
      </div>
    </>
  );
}
