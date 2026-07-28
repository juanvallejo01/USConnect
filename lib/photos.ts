/**
 * Arma la lista de fotos que se muestra en Descubrir y en las celebraciones
 * de match: la foto de perfil va primero, seguida de la galería, sin
 * duplicar la misma URL dos veces.
 */
export function getDisplayPhotos(
  photoUrl?: string | null,
  photos?: readonly string[] | null,
): string[] {
  const gallery = (photos ?? []).filter(Boolean)
  if (!photoUrl) return gallery
  return [photoUrl, ...gallery.filter((p) => p !== photoUrl)]
}
