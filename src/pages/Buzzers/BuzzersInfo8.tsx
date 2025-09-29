import { Header } from "@/components/Header";
import logica from "@/assets/imgs/LogicaEnvio.svg";

export default function BuzzersInfo8(): React.ReactElement {
  return(
    <>
      <Header
        title=""
        showIdeaButton={false}
      />
      <div className="h-screen flex flex-col items-center gap-3.5">
        <h2 className="text-ubuntu tx-bl font-medium text-lg mb-1"> Placa reproduz sequência gravada</h2>
        <p className="text-ubuntu text-text font-medium text-md mb-1 mx-2">O app envia para a placa a lista de notas e tempos lidos do arquivo.</p>
        <p className="text-ubuntu text-text font-medium text-md mb-1 mx-2">A placa percorre essa lista do início ao fim, tocando cada nota no buzzer pelo tempo indicado, exatamente na ordem registrada no arquivo.</p>
        <img src={logica} alt="imagem cel_placa_musica"/>,
        <div className="items-center p-4 rounded-lg bg-gray-300">
            <p className="text-ubuntu text-text font-medium text-md mb-1">para cada (nota, tempo) em lista_de_notas:</p>
            <p className="text-ubuntu text-text font-medium text-md mb-1 mx-2">tocar(nota)</p>
            <p className="text-ubuntu text-text font-medium text-md mb-1 mx-2">esperar(tempo)</p>
        </div>
      </div>
    </>
  );
}