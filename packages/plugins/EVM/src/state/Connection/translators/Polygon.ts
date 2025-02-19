import { EthereumMethodType, PayloadEditor, ProviderType } from '@masknet/web3-shared-evm'
import type { Context } from '../types.js'
import { Base } from './Base.js'

export class Polygon extends Base {
    override async encode(context: Context): Promise<void> {
        await super.encode(context)
        if (!context.config) return

        // the current version of metamask doesn't support polygon with EIP1559
        if (context.providerType !== ProviderType.MetaMask) return

        if (context.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return

        const config = {
            ...context.config,
            // keep the legacy gasPrice
            ...(PayloadEditor.fromPayload(context.request)
                ? {}
                : { gasPrice: context.config.gasPrice ?? (await context.connection.getGasPrice()) }),
        }

        delete config.maxFeePerGas
        delete config.maxPriorityFeePerGas

        context.config = config
    }
}
