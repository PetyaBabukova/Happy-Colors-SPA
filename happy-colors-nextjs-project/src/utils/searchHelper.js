export function handleSearchSubmit(e, searchTerm, router) {
  e.preventDefault();

  const trimmed = searchTerm.trim();
  if (trimmed.length > 0) {
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }
}
