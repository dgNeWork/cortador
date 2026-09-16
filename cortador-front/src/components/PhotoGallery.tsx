import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { GalleryPhoto } from "../config/gallery";
import PlaceholderImage from "./PlaceholderImage";

type PhotoGalleryProps = {
  photos: GalleryPhoto[];
};

// Galería con una foto grande arriba y, debajo, una tira horizontal
// de miniaturas. Al pinchar una miniatura, se abre en el hueco grande.
export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedId, setSelectedId] = useState(photos[0].id);
  const selected = photos.find((photo) => photo.id === selectedId) ?? photos[0];

  return (
    <div>
      <div className="overflow-hidden rounded-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <PlaceholderImage url={selected.url} alt={selected.caption} className="aspect-[16/10] w-full" />
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-3 text-sm text-ink-muted">{selected.caption}</p>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedId(photo.id)}
            className={`shrink-0 overflow-hidden rounded-sm transition-opacity ${
              photo.id === selected.id ? "opacity-100 ring-2 ring-brand-600" : "opacity-60 hover:opacity-90"
            }`}
          >
            <PlaceholderImage url={photo.url} alt={photo.caption} className="h-20 w-20 sm:h-24 sm:w-24" />
          </button>
        ))}
      </div>
    </div>
  );
}
