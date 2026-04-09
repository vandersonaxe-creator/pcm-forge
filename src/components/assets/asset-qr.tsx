"use client";

import { useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import type { Asset } from "@/lib/types/database";

export function AssetQRCode({ asset }: { asset: Asset }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const qrValue = `${typeof window !== "undefined" ? window.location.origin : ""}/assets/${asset.id}`;

  const downloadPNG = () => {
    const canvas = document.getElementById(`qr-canvas-${asset.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    
    // High-res png
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `QR_${asset.tag}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSVG = () => {
    const svg = document.getElementById(`qr-svg-${asset.id}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `QR_${asset.tag}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Habilite o pop-up no seu navegador para imprimir a etiqueta.");

    const canvas = document.getElementById(`qr-canvas-${asset.id}`) as HTMLCanvasElement;
    const imgData = canvas ? canvas.toDataURL("image/png") : "";

    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir QR Code - ${asset.tag}</title>
          <style>
            body { 
              font-family: sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .label-container {
              border: 1px solid #000;
              padding: 24px;
              text-align: center;
              border-radius: 8px;
            }
            h1 { margin: 0 0 10px 0; font-size: 24px; }
            h2 { margin: 0 0 16px 0; font-size: 16px; font-weight: normal; }
            img { width: 250px; height: 250px; }
            
            @media print {
              body { justify-content: flex-start; padding-top: 40px; }
              .label-container { border: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.setTimeout(window.close, 500);">
          <div class="label-container">
            <h1>${asset.tag}</h1>
            <h2>${asset.name}</h2>
            ${imgData ? `<img src="${imgData}" />` : 'Erro ao carregar QRCode'}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="p-4 bg-white rounded-xl" ref={qrRef}>
        <QRCodeSVG
          id={`qr-svg-${asset.id}`}
          value={qrValue}
          size={160}
          level="M"
          includeMargin={false}
        />
        {/* Hidden high-res canvas for reliable PNG download and print */}
        <div style={{ display: "none" }}>
          <QRCodeCanvas
            id={`qr-canvas-${asset.id}`}
            value={qrValue}
            size={1024} // very high res
            level="M"
            includeMargin={true}
          />
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground text-center mb-1">
        Escaneie ou use as ações abaixo para a etiqueta
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 w-full">
        <Button variant="outline" size="sm" onClick={downloadPNG} className="text-xs h-8">
          <Download className="h-3 w-3 mr-1.5" /> PNG
        </Button>
        <Button variant="outline" size="sm" onClick={downloadSVG} className="text-xs h-8">
          <Download className="h-3 w-3 mr-1.5" /> SVG
        </Button>
        <Button variant="default" size="sm" onClick={printQR} className="text-xs h-8">
          <Printer className="h-3 w-3 mr-1.5" /> Imprimir
        </Button>
      </div>
    </div>
  );
}
