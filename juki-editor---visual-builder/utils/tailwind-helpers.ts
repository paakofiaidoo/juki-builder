/**
 * Manages Tailwind CSS classes by removing any existing classes that match a given regex
 * and then adding a new class if provided.
 * @param currentClasses - The full current className string.
 * @param classGroupRegex - A regex that matches the group of classes to be replaced (e.g., /w-\[?\d+px\]?|w-\d+/).
 * @param newClass - The new class to add (e.g., 'w-[250px]'). If empty, just removes matching classes.
 * @returns The updated className string.
 */
export function manageTailwindClass(
  currentClasses: string, 
  classGroupRegex: RegExp, 
  newClass: string
): string {
  const otherClasses = currentClasses
    .split(/\s+/)
    .filter(c => !classGroupRegex.test(c) && c.trim() !== '')
    .join(' ');
  
  if (newClass) {
    return `${otherClasses} ${newClass}`.trim();
  }
  
  return otherClasses;
}