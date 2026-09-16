/**
 * Aquí se guardan los datos del negocio que se ven en toda la web.
 * Esta app es una plantilla genérica: para dejarla lista para un cortador
 * en concreto, solo hay que cambiar este archivo (más los colores en
 * index.css y el favicon) - ningún componente debe tener el nombre del
 * negocio escrito directamente.
 */
export const siteConfig = {
  businessName: "Cortador Pro",
  tagline: "Corte de jamón profesional para tus eventos",
  contactEmail: "hola@cortadorpro.example",
  contactPhone: "+34 600 000 000",

  // Redes sociales para el pie de página. El enlace de WhatsApp se
  // construye a partir de contactPhone, así no hay que repetir el número.
  instagramUrl: "https://instagram.com/cortadorpro",

  // Logo del negocio para la cabecera. Si se deja vacío, la cabecera
  // muestra un hueco reservado en su lugar (para que se note que falta).
  logoUrl: "/images/logo2.png",

  // Datos de la sección "Quién soy": el cortador se presenta con foto,
  // una historia breve y un par de datos que dan confianza al cliente.
  owner: {
    name: "Nombre del cortador",
    photoUrl: "/images/quien-soy-ilustracion.png",
    bio: "Todo empezó en la cocina de mi abuelo, viéndole cortar el jamón de las Navidades con una paciencia que entonces no entendía. Años después, tras formarme y cortar cientos de piezas en bodas, comuniones y eventos de empresa, sigo persiguiendo lo mismo que él: que cada loncha sea perfecta y que en tu mesa se note el mimo con el que se ha tratado el jamón. No es solo cortar; es la parte del evento que la gente recuerda.",
    yearsExperience: 10,
    eventsCount: 200,
  },
};
