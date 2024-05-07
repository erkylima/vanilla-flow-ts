export function DivBuilder(id:string, className: string): HTMLElement{
    const doc = document.createElement("div");
    doc.className = className;
    doc.id = id;
    return doc;
}

export function ButtonBuilder(id:string, className: string): HTMLElement{
    const doc = document.createElement("button");
    doc.className = className;
    doc.id = id;
    return doc;
}

export function ClickOutside(element: any, callback: Function) {
    const handleClick = (event) => {
        if (!element.contains(event.target)) {
            callback();
        }
    };

    document.addEventListener('click', handleClick);

    return () => {
        document.removeEventListener('click', handleClick);
    };
}

export function produce<T>(fn: (state: T) => void): (state: T) => T {
    
    return (state: T) => {
        const newState = { ...state }; // Clona o estado para garantir imutabilidade        
        fn(newState); // Aplica as atualizações de estado
        return newState; // Retorna o novo estado
    };
}