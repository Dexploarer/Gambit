export function nowTs(): number {
  return Date.now();
}

export function nextVersion(current: number | undefined): number {
  return (current ?? 0) + 1;
}

export function jsonEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function jobId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}
