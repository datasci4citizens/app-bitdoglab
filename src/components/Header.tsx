import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import idea from "@/assets/imgs/lampada.png";

interface HeaderProps {
  title: string;
  showIdeaButton?: boolean;
  ideaButtonPath?: string;
}

export function Header({ title, showIdeaButton = false, ideaButtonPath = "" }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="text-ubuntu flex items-center p-4">
      <div className="flex-1 flex justify-start">
        <Button variant="blue" onClick={() => navigate("/components")}>
          Voltar
        </Button>
      </div>
      
      <h1 className="font-bold text-xl flex-1 text-center p-6">{title}</h1>
      
      <div className="flex-1 flex justify-end">
        {showIdeaButton && (
          <button onClick={() => navigate(ideaButtonPath)}>
            <img 
              src={idea} 
              alt="Como funciona?" 
              className="w-10" 
            />
          </button>
        )}
      </div>
    </header>
  );
}