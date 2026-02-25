export function slugify(text) {
  const cyrillicToLatinMap = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd',
    е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u',
    ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
    щ: 'sht', ъ: 'a', ь: '', ю: 'yu', я: 'ya'
  };

  return text
    .toLowerCase()
    .split('')
    .map(char => cyrillicToLatinMap[char] || char)
    .join('')
    .replace(/\s+/g, '-')        // space -> -
    .replace(/[^\w\-]+/g, '')    // remove non-word chars
    .replace(/\-\-+/g, '-')      // collapse multiple dashes
    .replace(/^-+|-+$/g, '');    // trim dashes from start/end
}
