// Test de componente: aquí sí renderizamos React de verdad (en un DOM
// simulado por jsdom) y simulamos un clic de usuario real, para comprobar
// el comportamiento tal y como lo vería alguien usando la web.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PhotoGallery from "./PhotoGallery";
import type { GalleryPhoto } from "../config/gallery";

const photos: GalleryPhoto[] = [
  { id: "1", url: "/images/foto-1.webp", caption: "Evento de gala" },
  { id: "2", url: "/images/foto-2.webp", caption: "Corte en directo" },
];

describe("PhotoGallery", () => {
  it("muestra la primera foto y su leyenda al montar el componente", () => {
    render(<PhotoGallery photos={photos} />);

    expect(screen.getByText("Evento de gala")).toBeInTheDocument();
  });

  it("al hacer clic en una miniatura, cambia la foto grande y su leyenda", async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={photos} />);

    // Cada miniatura es un <button> que envuelve una <img> con el "alt"
    // como caption; la buscamos por ese nombre accesible, como haría un
    // usuario guiándose por lo que lee en pantalla.
    const secondThumbnail = screen.getByRole("button", { name: "Corte en directo" });
    await user.click(secondThumbnail);

    expect(screen.getByText("Corte en directo")).toBeInTheDocument();
    expect(screen.queryByText("Evento de gala")).not.toBeInTheDocument();
  });
});
