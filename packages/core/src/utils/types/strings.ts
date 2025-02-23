export function startWithRegExp(value: string): RegExp {
  return new RegExp(`^${value}`);
}
