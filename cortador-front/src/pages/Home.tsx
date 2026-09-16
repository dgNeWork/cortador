import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PhotoGallery from "../components/PhotoGallery";
import PlaceholderImage from "../components/PlaceholderImage";
import { galleryPhotos } from "../config/gallery";
import { siteConfig } from "../config/site";

// Textos de las dos modalidades de servicio, se muestran en la home.
const services = [
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
];

// Pasos del proceso de reserva, para la sección "Cómo funciona".
const steps = [
  {
    number: "01",
    title: "Reserva tu fecha",
    description: "Rellena el formulario con los detalles de tu evento en menos de dos minutos.",
  },
  {
    number: "02",
    title: "Confirmamos contigo",
    description: "Revisamos tu solicitud y te confirmamos disponibilidad y detalles finales.",
  },
  {
    number: "03",
    title: "Disfruta el evento",
    description: "Llegamos puntuales con el material necesario y nos encargamos de todo el corte.",
  },
];

// Animación simple para Framer Motion: aparece con un poco de
// desplazamiento hacia arriba (de "hidden" a "visible").
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Foto destacada para el hero, elegida entre las de la galería.
const heroPhoto = galleryPhotos.find((photo) => photo.id === "2") ?? galleryPhotos[0];

// Página de inicio: hero, quién soy, galería, modalidades de servicio,
// cómo funciona y CTA final.
export default function Home() {
  const location = useLocation();

  // El botón "Galería" de la cabecera enlaza a "/#galeria": si venimos
  // de otra página, al llegar aquí hacemos scroll hasta esa sección.
  useEffect(() => {
    if (location.hash === "#galeria") {
      document.getElementById("galeria")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);

  return (
    <>
      {/* Hero: primer bloque que se ve al entrar, con foto grande a un lado
          para que el negocio se sienta fotográfico desde el primer segundo. */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-16 sm:pt-24 lg:grid-cols-2 lg:items-center lg:gap-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-display text-sm uppercase tracking-[0.2em] text-brand-600">
            {siteConfig.tagline}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Corte de jamón profesional para bodas y eventos
          </h1>
          <p className="mt-6 text-lg text-ink-muted">
            Precisión, presentación y experiencia en cada loncha. Reserva en minutos y deja el
            resto en nuestras manos.
          </p>
          <Link
            to="/reservar"
            className="mt-8 inline-block rounded-full bg-brand-600 px-8 py-3 text-sm font-medium text-surface transition-colors hover:bg-brand-700"
          >
            Reservar ahora
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          <PlaceholderImage
            url={heroPhoto.url}
            alt={heroPhoto.caption}
            className="aspect-[4/5] w-full rounded-sm"
          />
        </motion.div>
      </section>

      {/* Quién soy: presenta a la persona detrás del servicio, justo
          después del hero, porque el cliente contrata a un profesional
          concreto, no solo un servicio. */}
      <section className="border-t border-border bg-surface-alt">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-center lg:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <PlaceholderImage
              url={siteConfig.owner.photoUrl}
              alt={`Foto de ${siteConfig.owner.name}`}
              className="aspect-[3/4] w-full max-w-xs rounded-sm"
            />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="font-display text-sm uppercase tracking-[0.2em] text-brand-600">
              Quién soy
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
              {siteConfig.owner.name}
            </h2>
            <p className="mt-5 max-w-2xl text-ink-muted">{siteConfig.owner.bio}</p>

            <div className="mt-8 flex gap-10">
              <div>
                <span className="font-display text-3xl font-semibold text-ink">
                  {siteConfig.owner.yearsExperience}+
                </span>
                <p className="mt-1 text-sm text-ink-muted">años de experiencia</p>
              </div>
              <div>
                <span className="font-display text-3xl font-semibold text-ink">
                  {siteConfig.owner.eventsCount}+
                </span>
                <p className="mt-1 text-sm text-ink-muted">eventos realizados</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Galería: fotos de eventos, para que el cliente se haga una idea
          de lo que contrata. El id="galeria" es el destino del enlace
          "Galería" de la cabecera y el pie de página. */}
      <section id="galeria" className="mx-auto max-w-4xl scroll-mt-20 px-6 py-20">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="font-display text-3xl font-semibold text-ink"
        >
          Eventos en los que hemos estado
        </motion.h2>

        <div className="mt-10">
          <PhotoGallery photos={galleryPhotos} />
        </div>
      </section>

      {/* Modalidades: las dos formas de contratar el servicio */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl font-semibold text-ink"
          >
            Modalidades de servicio
          </motion.h2>

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border-t border-brand-400 pt-6"
              >
                <h3 className="font-display text-xl font-semibold text-ink">{service.title}</h3>
                <p className="mt-3 text-ink-muted">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona: los 3 pasos del proceso */}
      <section className="border-t border-border bg-surface-alt">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl font-semibold text-ink"
          >
            Cómo funciona
          </motion.h2>

          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <span className="font-display text-4xl font-semibold text-brand-400">
                  {step.number}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-ink-muted">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final: último empujón para que reserve */}
      <section className="border-t border-border bg-ink">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-6xl px-6 py-16 text-center"
        >
          <h2 className="font-display text-3xl font-semibold text-surface">
            ¿Listo para tu evento?
          </h2>
          <p className="mt-3 text-surface/80">
            Cuéntanos los detalles y te confirmamos disponibilidad cuanto antes.
          </p>
          <Link
            to="/reservar"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-3 text-sm font-medium text-surface transition-colors hover:bg-brand-400"
          >
            Reservar ahora
          </Link>
        </motion.div>
      </section>
    </>
  );
}
