/////////////////////////
// CUSTOM HOOK TYPES //
/////////////////////////

export interface FetchState<T> {
  data: T | null,
  isLoading: boolean,
  error: string | null,
};

export interface WindowSize {
  width: number;
  height: number;
}

