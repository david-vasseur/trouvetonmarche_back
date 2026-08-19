export function slugify(value: string): string {
    return value
        .normalize("NFD")                  // sépare les accents
        .replace(/[\u0300-\u036f]/g, "")   // supprime les accents
        .toLowerCase()
        .trim()
        .replace(/&/g, "et")
        .replace(/[^a-z0-9]+/g, "-")       // espaces + caractères spéciaux → -
        .replace(/^-+|-+$/g, "");          // supprime les - au début/à la fin
}