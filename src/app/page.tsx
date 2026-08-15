import { AvisoDeDatos } from "@/components/AvisoDeDatos.tsx";
import { Tablero } from "@/components/Tablero.tsx";

export default function Home() {
  // El aviso va acá y no dentro del tablero porque el tablero tiene tres
  // salidas distintas —bienvenida, crear viaje y el tablero mismo— y el
  // problema del que avisa no depende de en cuál esté parado el usuario.
  return (
    <>
      <AvisoDeDatos />
      <Tablero />
    </>
  );
}
