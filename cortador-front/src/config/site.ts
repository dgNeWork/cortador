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

  // Modo presupuesto: si está activado (true), el cliente no ve ningún
  // precio salvo el de los jamones. Envía una solicitud de presupuesto y
  // disponibilidad, y el precio calculado solo le llega al cortador, que
  // lo cierra con él por teléfono. Con false, el cliente ve el precio
  // desglosado en vivo mientras rellena el formulario.
  quoteMode: true,

  // Dirección pública de la web, sin barra final. Hace falta para la
  // imagen que muestran WhatsApp o Google al compartir el enlace, que
  // tiene que ser una dirección completa (no vale "/images/...").
  siteUrl: "https://cortadorpro.example",

  // Descripción corta del negocio: es el texto que sale debajo del
  // título en Google y al compartir el enlace por WhatsApp.
  description:
    "Cortador de jamón profesional para bodas, comuniones y eventos. Consulta presupuesto y disponibilidad para tu fecha.",

  // Imagen que acompaña al enlace al compartirlo. Mejor una propia del
  // negocio (logo o foto sin marcas de otros).
  shareImageUrl: "/images/logo2.png",

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

  // Textos de la página de inicio, sección a sección (de arriba abajo).
  home: {
    heroTitle: "Corte de jamón profesional para bodas y eventos",
    heroText:
      "Precisión, presentación y experiencia en cada loncha. Consulta tu fecha en minutos y deja el resto en nuestras manos.",
    galleryTitle: "Eventos en los que hemos estado",
    servicesTitle: "Modalidades de servicio",
    // Las dos formas de contratar el servicio.
    services: [
      {
        title: "Solo corte",
        description:
          "Tú aportas la pieza y nosotros nos encargamos del corte profesional en directo, con la técnica y el ritmo adecuados para tu evento.",
      },
      {
        title: "Servicio completo",
        description:
          "Llevamos el jamón (cebo, cebo de campo o bellota, a elegir) además del corte, para que no tengas que preocuparte de nada más.",
      },
    ],
    stepsTitle: "Cómo funciona",
    // Pasos del proceso de reserva. El número (01, 02...) lo pone la
    // página según el orden, así que aquí no hace falta escribirlo.
    steps: [
      {
        title: "Pide tu presupuesto",
        description: "Elige el día y cuéntanos los detalles de tu evento en menos de dos minutos.",
      },
      {
        title: "Hablamos contigo",
        description: "Te llamamos para cerrar los detalles y el precio, y te confirmamos la fecha.",
      },
      {
        title: "Disfruta el evento",
        description: "Llegamos puntuales con el material necesario y nos encargamos de todo el corte.",
      },
    ],
    ctaTitle: "¿Listo para tu evento?",
    ctaText: "Cuéntanos los detalles y te confirmamos disponibilidad cuanto antes.",
  },
};
