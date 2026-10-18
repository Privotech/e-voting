const globalStore = globalThis as typeof globalThis & {
  votingResultsVisible?: boolean;
};

if (globalStore.votingResultsVisible === undefined) {
  globalStore.votingResultsVisible = true;
}

export function getResultsVisibility(): boolean {
  return globalStore.votingResultsVisible ?? true;
}

export function setResultsVisibility(visible: boolean): void {
  globalStore.votingResultsVisible = visible;
}

export function toggleResultsVisibility(): boolean {
  const visible = !getResultsVisibility();
  setResultsVisibility(visible);
  return visible;
}
