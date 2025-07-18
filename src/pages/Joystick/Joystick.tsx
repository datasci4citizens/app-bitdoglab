import { Header } from "@/components/Header";

export default function Joystick() {
  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header title="Joystick" showIdeaButton={false} />
      <main className="h-screen flex flex-col items-center justify-center gap-3.5">
        <h2 className="text-ubuntu font-bold text-md mb-5 text-heading">Em construção!</h2>
      </main>
    </div>
  );
}
