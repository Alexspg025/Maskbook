import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { BindingProof, EMPTY_LIST, MaskEvents } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useEffect } from 'react'
import { useAsyncFn } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'

export function usePersonaProofs(
    publicKey?: string,
    message?: WebExtensionMessage<MaskEvents>,
): AsyncStateRetry<BindingProof[]> {
    const [state, fn] = useAsyncFn(
        async (enableCache = true) => {
            try {
                if (!publicKey) return EMPTY_LIST

                const binding = await NextIDProof.queryExistedBindingByPersona(publicKey, enableCache)
                return binding?.proofs ?? EMPTY_LIST
            } catch {
                return EMPTY_LIST
            }
        },
        [publicKey],
    )

    useEffect(() => {
        fn(true)
    }, [publicKey])

    const retry = () => fn(false)

    useEffect(() => message?.events.ownProofChanged.on(retry), [retry])

    if (state.loading) {
        return {
            loading: true,
            retry,
        }
    }

    if (state.error) {
        return {
            loading: false,
            error: state.error,
            retry,
        }
    }

    return {
        value: state.value ?? EMPTY_LIST,
        loading: state.loading,
        retry,
    }
}
