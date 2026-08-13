/**
 * Destinos sugeridos.
 *
 * ── Por qué una lista local y no una API de lugares ────────────────────────
 *
 * Porque la app entera está construida sobre no depender de un servidor: se
 * abre el link y funciona en dos segundos, sin registro, sin llave y sin nada
 * que se pueda caer el día de la entrega. Meter una llamada de red justo en el
 * primer campo del primer formulario tiraría esa decisión por la ventana a
 * cambio de una lista que igual nadie va a agotar.
 *
 * Son ~110 entradas, no un directorio mundial: los destinos que de verdad
 * escribe alguien que viaja desde Colombia. Una lista corta y bien escogida
 * acierta más que una larga, porque la primera sugerencia casi siempre es la
 * buena.
 *
 * ⚠️ Recorte consciente: quien vaya a un pueblo que no está acá simplemente lo
 * escribe. El campo nunca obliga a elegir de la lista — sugerir no es exigir.
 */

export type Destino = { ciudad: string; pais: string };

export const DESTINOS: Destino[] = [
  // Colombia primero: es desde donde y hacia donde más se viaja acá.
  { ciudad: "Cartagena", pais: "Colombia" },
  { ciudad: "Medellín", pais: "Colombia" },
  { ciudad: "Bogotá", pais: "Colombia" },
  { ciudad: "Santa Marta", pais: "Colombia" },
  { ciudad: "Cali", pais: "Colombia" },
  { ciudad: "Barranquilla", pais: "Colombia" },
  { ciudad: "San Andrés", pais: "Colombia" },
  { ciudad: "Providencia", pais: "Colombia" },
  { ciudad: "Bucaramanga", pais: "Colombia" },
  { ciudad: "Pereira", pais: "Colombia" },
  { ciudad: "Manizales", pais: "Colombia" },
  { ciudad: "Armenia", pais: "Colombia" },
  { ciudad: "Salento", pais: "Colombia" },
  { ciudad: "Filandia", pais: "Colombia" },
  { ciudad: "Guatapé", pais: "Colombia" },
  { ciudad: "Jardín", pais: "Colombia" },
  { ciudad: "Jericó", pais: "Colombia" },
  { ciudad: "Santa Fe de Antioquia", pais: "Colombia" },
  { ciudad: "Villa de Leyva", pais: "Colombia" },
  { ciudad: "Barichara", pais: "Colombia" },
  { ciudad: "San Gil", pais: "Colombia" },
  { ciudad: "Mompox", pais: "Colombia" },
  { ciudad: "Minca", pais: "Colombia" },
  { ciudad: "Palomino", pais: "Colombia" },
  { ciudad: "Cabo de la Vela", pais: "Colombia" },
  { ciudad: "Punta Gallinas", pais: "Colombia" },
  { ciudad: "Riohacha", pais: "Colombia" },
  { ciudad: "Valledupar", pais: "Colombia" },
  { ciudad: "Tolú", pais: "Colombia" },
  { ciudad: "Capurganá", pais: "Colombia" },
  { ciudad: "Nuquí", pais: "Colombia" },
  { ciudad: "Bahía Solano", pais: "Colombia" },
  { ciudad: "Buenaventura", pais: "Colombia" },
  { ciudad: "Popayán", pais: "Colombia" },
  { ciudad: "Pasto", pais: "Colombia" },
  { ciudad: "San Agustín", pais: "Colombia" },
  { ciudad: "Neiva", pais: "Colombia" },
  { ciudad: "Ibagué", pais: "Colombia" },
  { ciudad: "Villavicencio", pais: "Colombia" },
  { ciudad: "Caño Cristales", pais: "Colombia" },
  { ciudad: "Leticia", pais: "Colombia" },
  { ciudad: "Tunja", pais: "Colombia" },
  { ciudad: "Monguí", pais: "Colombia" },
  { ciudad: "Guaduas", pais: "Colombia" },
  { ciudad: "Girardot", pais: "Colombia" },
  { ciudad: "Melgar", pais: "Colombia" },
  { ciudad: "Montería", pais: "Colombia" },
  { ciudad: "Sincelejo", pais: "Colombia" },
  { ciudad: "Cúcuta", pais: "Colombia" },

  // El resto de América
  { ciudad: "Ciudad de Panamá", pais: "Panamá" },
  { ciudad: "Bocas del Toro", pais: "Panamá" },
  { ciudad: "San José", pais: "Costa Rica" },
  { ciudad: "Ciudad de México", pais: "México" },
  { ciudad: "Cancún", pais: "México" },
  { ciudad: "Tulum", pais: "México" },
  { ciudad: "Playa del Carmen", pais: "México" },
  { ciudad: "Oaxaca", pais: "México" },
  { ciudad: "Guadalajara", pais: "México" },
  { ciudad: "Punta Cana", pais: "República Dominicana" },
  { ciudad: "Santo Domingo", pais: "República Dominicana" },
  { ciudad: "La Habana", pais: "Cuba" },
  { ciudad: "Ciudad de Guatemala", pais: "Guatemala" },
  { ciudad: "Antigua", pais: "Guatemala" },
  { ciudad: "Curazao", pais: "Curazao" },
  { ciudad: "Oranjestad", pais: "Aruba" },
  { ciudad: "Lima", pais: "Perú" },
  { ciudad: "Cusco", pais: "Perú" },
  { ciudad: "Arequipa", pais: "Perú" },
  { ciudad: "Quito", pais: "Ecuador" },
  { ciudad: "Guayaquil", pais: "Ecuador" },
  { ciudad: "Galápagos", pais: "Ecuador" },
  { ciudad: "Santiago", pais: "Chile" },
  { ciudad: "Valparaíso", pais: "Chile" },
  { ciudad: "San Pedro de Atacama", pais: "Chile" },
  { ciudad: "Buenos Aires", pais: "Argentina" },
  { ciudad: "Bariloche", pais: "Argentina" },
  { ciudad: "Mendoza", pais: "Argentina" },
  { ciudad: "Montevideo", pais: "Uruguay" },
  { ciudad: "Punta del Este", pais: "Uruguay" },
  { ciudad: "Río de Janeiro", pais: "Brasil" },
  { ciudad: "São Paulo", pais: "Brasil" },
  { ciudad: "Florianópolis", pais: "Brasil" },
  { ciudad: "La Paz", pais: "Bolivia" },
  { ciudad: "Asunción", pais: "Paraguay" },
  { ciudad: "Miami", pais: "Estados Unidos" },
  { ciudad: "Orlando", pais: "Estados Unidos" },
  { ciudad: "Nueva York", pais: "Estados Unidos" },
  { ciudad: "Los Ángeles", pais: "Estados Unidos" },
  { ciudad: "Las Vegas", pais: "Estados Unidos" },
  { ciudad: "Chicago", pais: "Estados Unidos" },
  { ciudad: "San Francisco", pais: "Estados Unidos" },
  { ciudad: "Washington", pais: "Estados Unidos" },
  { ciudad: "Toronto", pais: "Canadá" },
  { ciudad: "Montreal", pais: "Canadá" },
  { ciudad: "Vancouver", pais: "Canadá" },

  // Europa y más allá
  { ciudad: "Madrid", pais: "España" },
  { ciudad: "Barcelona", pais: "España" },
  { ciudad: "Sevilla", pais: "España" },
  { ciudad: "Valencia", pais: "España" },
  { ciudad: "Lisboa", pais: "Portugal" },
  { ciudad: "Oporto", pais: "Portugal" },
  { ciudad: "París", pais: "Francia" },
  { ciudad: "Roma", pais: "Italia" },
  { ciudad: "Florencia", pais: "Italia" },
  { ciudad: "Milán", pais: "Italia" },
  { ciudad: "Venecia", pais: "Italia" },
  { ciudad: "Londres", pais: "Reino Unido" },
  { ciudad: "Edimburgo", pais: "Reino Unido" },
  { ciudad: "Ámsterdam", pais: "Países Bajos" },
  { ciudad: "Berlín", pais: "Alemania" },
  { ciudad: "Múnich", pais: "Alemania" },
  { ciudad: "Praga", pais: "Chequia" },
  { ciudad: "Viena", pais: "Austria" },
  { ciudad: "Budapest", pais: "Hungría" },
  { ciudad: "Atenas", pais: "Grecia" },
  { ciudad: "Santorini", pais: "Grecia" },
  { ciudad: "Estambul", pais: "Turquía" },
  { ciudad: "Dubái", pais: "Emiratos Árabes Unidos" },
  { ciudad: "El Cairo", pais: "Egipto" },
  { ciudad: "Marrakech", pais: "Marruecos" },
  { ciudad: "Ciudad del Cabo", pais: "Sudáfrica" },
  { ciudad: "Tokio", pais: "Japón" },
  { ciudad: "Kioto", pais: "Japón" },
  { ciudad: "Seúl", pais: "Corea del Sur" },
  { ciudad: "Bangkok", pais: "Tailandia" },
  { ciudad: "Bali", pais: "Indonesia" },
  { ciudad: "Sídney", pais: "Australia" },
];

/**
 * Quita tildes y pasa a minúscula.
 *
 * Es lo que hace que escribir «medellin» o «bogota» encuentre algo. Nadie pone
 * tildes cuando busca, y un campo que exige escribirlas bien para funcionar es
 * un campo que no funciona.
 */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    // Los diacríticos van escapados y no como caracteres sueltos: escritos
    // literales, cualquier editor o copiar-pegar los puede alterar en silencio.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Busca destinos que empiecen o contengan lo escrito.
 *
 * Los que EMPIEZAN por lo escrito van primero. Escribiendo «san» importa más
 * ver «San Andrés» que «Ciudad del Cabo», aunque las dos contengan esas letras;
 * el orden por coincidencia al inicio es lo que hace que la primera sugerencia
 * suela ser la correcta.
 *
 * Busca en la ciudad Y en el país: alguien que escribe «italia» está buscando a
 * dónde ir, no confirmando un nombre que ya sabe.
 */
export function buscarDestinos(consulta: string, limite = 6): Destino[] {
  const q = normalizar(consulta);
  if (q.length < 2) return [];

  const empiezan: Destino[] = [];
  const contienen: Destino[] = [];

  for (const d of DESTINOS) {
    const ciudad = normalizar(d.ciudad);
    const pais = normalizar(d.pais);
    if (ciudad.startsWith(q) || pais.startsWith(q)) empiezan.push(d);
    else if (ciudad.includes(q) || pais.includes(q)) contienen.push(d);
    if (empiezan.length >= limite) break;
  }

  return [...empiezan, ...contienen].slice(0, limite);
}
