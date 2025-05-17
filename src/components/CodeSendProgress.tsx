import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Spinner } from "./ui/spinner";
import { Alert, AlertDescription } from "./ui/alert";

interface CodeSendProgressProps {
  isOpen: boolean;
  onClose: () => void;
  deviceName: string;
  progress: number;
  status: "sending" | "success" | "error" | "waiting";
  errorMessage?: string;
}

export function CodeSendProgress({
  isOpen,
  onClose,
  deviceName,
  progress,
  status,
  errorMessage,
}: CodeSendProgressProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {status === "sending" && `Enviando código para ${deviceName}`}
            {status === "success" && "Envio concluído"}
            {status === "error" && "Erro no envio"}
            {status === "waiting" && "Aguardando dispositivo"}
          </DialogTitle>
        </DialogHeader>

        {status === "sending" && (
          <div className="py-4 space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {progress}% concluído
              </span>
              <Spinner size="sm" />
            </div>
            <p className="text-sm text-gray-500">
              Por favor, aguarde enquanto enviamos o código para o dispositivo.
            </p>
          </div>
        )}

        {status === "waiting" && (
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-center py-4">
              <Spinner size="lg" />
            </div>
            <p className="text-center text-sm text-gray-500">
              Aguardando resposta do bootstrap no Raspberry Pi...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4 space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Código enviado com sucesso
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      O código foi transferido e está em execução no Raspberry
                      Pi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="py-4 space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {errorMessage ||
                  "Ocorreu um erro ao enviar o código para o dispositivo."}
              </AlertDescription>
            </Alert>
            <Button onClick={onClose} variant="outline" className="w-full">
              Tentar novamente
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
