export function splitCase(input: string): string {
  return !input || input.indexOf(' ') >= 0
    ? input
    : (input.charAt(0).toUpperCase() + input.substring(1))
        .split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/g)
        .map((x) => x.replace(/([0-9]+)/g, '$1 '))
        .join(' ');
}
