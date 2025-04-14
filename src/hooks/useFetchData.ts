import { useEffect, useState } from "react";
import * as d3 from 'd3';

export interface FetchState<T> {
  data: T | null,
  isLoading: boolean,
  error: string | null,
};

export const useFetchData = <T>(url: string): FetchState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => console.log('fetch', data, isLoading, error), [data, isLoading, error])

  const getData = () => {
    setIsLoading(true);
    setError(null);

    d3.json<T>(url)
      .then((result: unknown) => {
        setData(result as T);
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching data', error)
        setIsLoading(false)
      })
  }
  useEffect(() => getData(), [url])

  return { data, isLoading, error };

}
