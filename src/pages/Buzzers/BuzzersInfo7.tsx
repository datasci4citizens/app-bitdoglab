import { Header } from "@/components/Header";

export default function BuzzersInfo7(): React.ReactElement {
  return(
    <>
      <Header
        title=""
        showIdeaButton={false}
      />
      <div className="h-screen flex flex-col items-center gap-3.5">
        <h2 className="text-ubuntu tx-bl font-medium text-lg mb-1"> Carregar a Gravação</h2>
        <p className="text-ubuntu font-small text-lg mb-1 mx-2 text-start">Ao selecionar esta opção, o usuário pode escolher um dos arquivo salvos localmente ao clicar no botão Gravações</p>
        <p className="text-ubuntu font-small text-lg mb-1 mx-2 text-start">Esse arquivo tera a sequência de notas e tempos já gravados. O app lê o conteúdo do arquivo, interpreta os dados e prepara a lista de eventos musicais para ser enviada à placa.</p>
        <div className="items-center p-4 rounded-lg bg-gray-300">
            <p>gravação = selecionar_gravação()</p>
            <p>lista_de_notas = ler_gravação(gravação)</p>
        </div>
      </div>
    </>
  );
}