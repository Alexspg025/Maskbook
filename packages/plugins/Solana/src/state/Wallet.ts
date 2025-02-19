import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { WalletState } from '@masknet/web3-state'
import { formatAddress, ProviderType, Transaction } from '@masknet/web3-shared-solana'

export class Wallet extends WalletState<ProviderType, Transaction> {
    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscriptions: {
            providerType?: Subscription<ProviderType>
        },
    ) {
        super(context, [], subscriptions, {
            formatAddress,
        })
    }
}
