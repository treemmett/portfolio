export function splitCase(input: string): string {
  return input.replaceAll(/[A-Z-_&](?=[a-z0-9]+)|[A-Z-_&]+(?![a-z0-9])/g, ' $&').trim();
}
