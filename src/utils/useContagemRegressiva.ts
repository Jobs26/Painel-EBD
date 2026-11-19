import { useCallback, useEffect, useState } from 'react';

/** Contagem regressiva em segundos (ex.: "Reenviar código em 42 s"). */
export function useContagemRegressiva(inicial = 0) {
  const [segundos, setSegundos] = useState(inicial);

  useEffect(() => {
    if (segundos <= 0) return;
    const id = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [segundos]);

  const reiniciar = useCallback((total: number) => setSegundos(total), []);
  return [segundos, reiniciar] as const;
}
