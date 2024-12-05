declare module 'feather-icons' {
    const feather: {
        icons: {
            [key: string]: {
                toSvg: (options?: { width?: number; height?: number }) => string;
            };
        };
    };
    export default feather;
}
