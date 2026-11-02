/** Путь к файлу из public/ с учётом basePath (GitHub Pages). <Link> добавляет basePath сам, а <img>, <a href> на PDF — нет. */
export function asset(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
