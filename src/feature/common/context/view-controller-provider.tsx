/* eslint-disable react-hooks/exhaustive-deps */

import { createContext, useContext, useLayoutEffect, useRef, useState, type PropsWithChildren } from "react";

const ViewControllerContext = createContext<IViewController | null>(null)

export interface IViewController<O = unknown> {
    updateOptions?: (options: O) => void;
    bootstrap: () => void;
    dispose: () => void;
}

export function ViewControllerProvider<V extends IViewController>(props: PropsWithChildren<{ vc: V }>) {
    return <ViewControllerContext.Provider value={props.vc}>{props.children}</ViewControllerContext.Provider>
}

export function useViewController<V extends IViewController>(Constructor: new () => V): V {
    const vc = useContext(ViewControllerContext)
    if (!vc) {
        throw new Error('useViewController must be used within a ViewControllerProvider')
    }

    const isCorrectInstance = vc instanceof Constructor
    if (!isCorrectInstance) {
        throw new Error(`${(vc as any)?.name || 'ViewController'} from ViewControllerProvider is not an instance of ${Constructor.name}`)
    }
    return vc
}

/**
 * Hook to automatically manage ViewController lifecycle
 *
 * @param getInstance - ViewController factory function
 * @param options - Configuration object
 * @param optDeps - Dependencies used in options, **every field used in options must be added to this dependency array**

 */
export function useBootstrapViewController<O = unknown, V extends IViewController<O> = IViewController<O>>(getInstance: () => V, options?: O, optDeps?: unknown[]) {
    const [vc] = useState(getInstance)
    const optionsRef = useRef(options)
    optionsRef.current = options
    const [isBootstrapped, setIsBootstrapped] = useState(false)

    useLayoutEffect(() => {
        vc.bootstrap()
        setIsBootstrapped(true)

        return () => {
            vc.dispose()
        }
    }, [vc])

    useLayoutEffect(() => {
        if (!optionsRef.current || !isBootstrapped) return
        vc.updateOptions?.(optionsRef.current)
    }, [vc, isBootstrapped, ...(optDeps || [])])
}