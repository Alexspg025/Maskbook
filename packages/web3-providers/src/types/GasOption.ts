import type { GasOptionType } from '@masknet/web3-shared-base'

export namespace GasOptionAPI {
    export interface Provider<ChainId, GasOption> {
        getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption> | undefined>
    }
}
