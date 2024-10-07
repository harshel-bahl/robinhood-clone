export function getCSSVariable(variableName: string): string | null {
    if (typeof window !== 'undefined') {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        return computedStyle.getPropertyValue(variableName).trim();
    }
    return null;
}
