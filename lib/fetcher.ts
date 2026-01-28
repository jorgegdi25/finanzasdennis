export const fetcher = async (url: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
            if (res.status === 401) {
                window.location.href = '/login';
                throw new Error('No autorizado');
            }
            const data = await res.json();
            const error = new Error(data.error || 'Ocurrió un error al cargar los datos');
            // @ts-ignore
            error.status = res.status;
            throw error;
        }

        return res.json();
    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('La carga está tardando demasiado. Por favor verifica tu conexión o recarga la página.');
        }
        throw err;
    }
};
