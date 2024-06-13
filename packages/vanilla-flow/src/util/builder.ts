export function addClickOutsideListener(element: ShadowRoot | HTMLElement, callback: () => void): () => void {
    // Event listener function
    function onClickOutside(event: MouseEvent) {
        const path = event.composedPath();

        if (!path.includes(element)) {
            callback();
        }

    }

    // Attach the listener to the document
    document.addEventListener('click', onClickOutside);

    // Return a function to remove the listener
    return function removeClickOutsideListener() {
        document.removeEventListener('click', onClickOutside);
    };
}

export function produce<T>(fn: (state: T) => void): (state: T) => T {
    
    return (state: T) => {
        const newState = { ...state }; // Clona o estado para garantir imutabilidade        
        fn(newState); // Aplica as atualizações de estado
        return newState; // Retorna o novo estado
    };
}