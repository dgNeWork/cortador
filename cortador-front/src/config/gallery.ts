/**
 * Fotos de eventos para la sección/página de galería. Cada cortador
 * sustituirá "url" por la ruta de su foto real; mientras tanto se deja
 * vacío y el componente PlaceholderImage muestra un hueco reservado.
 */
export type GalleryPhoto = {
  id: string;
  url: string;
  caption: string;
};

export const galleryPhotos: GalleryPhoto[] = [
  { id: "1", url: "/images/galeria/whatsapp-evento.webp", caption: "Evento de gala" },
  { id: "2", url: "/images/galeria/19-1024x1024.webp", caption: "Corte en directo para invitados" },
  { id: "3", url: "/images/galeria/catering-jamon-cortador-870x555.webp", caption: "Detalle especial para una boda" },
  { id: "4", url: "/images/galeria/Cortador-de-jamon-en-Madrid.webp", caption: "Mesa de degustación" },
  { id: "5", url: "/images/galeria/contratar-cortador-de-jamon-para-eventos.webp", caption: "Colocación de las lonchas" },
  { id: "6", url: "/images/galeria/cortador-de-jamon-870x555.webp", caption: "Servicio para grupos grandes" },
  { id: "7", url: "/images/galeria/cortador_de_jamon_precio.webp", caption: "Presentación cuidada al detalle" },
  { id: "8", url: "/images/galeria/corte-jamon-1.webp", caption: "Loncheado fino a mano" },
  { id: "9", url: "/images/galeria/de-apoyo5.webp", caption: "Últimos retoques antes de servir" },
  { id: "10", url: "/images/galeria/ham-cutter-for-events-870x555.webp", caption: "Buffet de jamón para grandes eventos" },
];
