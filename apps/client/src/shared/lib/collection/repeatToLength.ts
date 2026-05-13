export function repeatToLength<T>(items: T[], length: number): T[] {
  if (items.length === 0 || length <= 0) {
    return [];
  }

  const result: T[] = [];
  for (let index = 0; index < length; index += 1) {
    result.push(items[index % items.length]);
  }

  return result;
}
