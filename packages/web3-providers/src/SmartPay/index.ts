import urlcat from 'urlcat'
import { first, omit } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import {
    ChainId,
    ContractWallet,
    Create2Factory,
    createContract,
    getSmartPayConstants,
    UserOperation,
} from '@masknet/web3-shared-evm'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import type { Wallet } from '@masknet/web3-contracts/types/Wallet.js'
import { BUNDLER_ROOT, FUNDER_ROOT, MAX_ACCOUNT_LENGTH } from './constants.js'
import type { BundlerAPI } from '../types/Bundler.js'
import { FunderAPI } from '../types/Funder.js'
import { MulticallAPI } from '../Multicall/index.js'
import { Web3API } from '../EVM/index.js'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { ContractAccountAPI } from '../entry-types.js'

export class SmartPayBundlerAPI implements BundlerAPI.Provider {
    private async healthz() {
        const response = await fetch(urlcat(BUNDLER_ROOT, '/healthz'), {
            method: 'GET',
        })
        const json: BundlerAPI.Healthz = await response.json()

        return {
            ...json,
        }
    }

    private async handle(userOperation: UserOperation) {
        const response = await fetch(urlcat(BUNDLER_ROOT, '/handle'), {
            method: 'POST',
            body: JSON.stringify({
                ...omit(userOperation, [
                    'initCode',
                    'callData',
                    'callGas',
                    'verificationGas',
                    'preVerificationGas',
                    'maxFeePerGas',
                    'maxPriorityFeePerGas',
                    'paymasterData',
                ]),
                init_code: userOperation.initCode,
                call_data: userOperation.callData,
                call_gas: userOperation.callGas,
                verification_gas: userOperation.verificationGas,
                pre_verification_gas: userOperation.preVerificationGas,
                max_fee_per_gas: userOperation.maxFeePerGas,
                max_priority_fee_per_gas: userOperation.maxPriorityFeePerGas,
                paymaster_data: userOperation.paymasterData,
            }),
        })
        const json: { tx_hash: string } = await response.json()
        return json.tx_hash
    }

    private async assetChainId(chainId: ChainId) {
        const chainIds = await this.getSupportedChainIds()
        if (!chainIds.includes(chainId)) throw new Error(`Not supported ${chainId}.`)
    }

    async getSigner(chainId: ChainId): Promise<string> {
        await this.assetChainId(chainId)

        const healthz = await this.healthz()
        return healthz.bundler_eoa
    }

    async getSupportedChainIds(): Promise<ChainId[]> {
        const healthz = await this.healthz()
        return [Number.parseInt(healthz.chain_id, 10)] as ChainId[]
    }
    async getSupportedEntryPoints(chainId: ChainId): Promise<string[]> {
        await this.assetChainId(chainId)

        const healthz = await this.healthz()
        return [healthz.entrypoint_contract_address]
    }
    simulateUserOperation(
        chainId: ChainId,
        userOperation: UserOperation,
    ): Promise<{ preOpGas: string; prefund: string }> {
        throw new Error('Method not implemented.')
    }
    async sendUserOperation(chainId: ChainId, userOperation: UserOperation): Promise<string> {
        await this.assetChainId(chainId)

        return this.handle(userOperation)
    }
}

export class SmartPayFunderAPI implements FunderAPI.Provider {
    private async assetChainId(chainId: ChainId) {
        const chainIds = await this.getSupportedChainIds()
        if (!chainIds.includes(chainId)) throw new Error(`Not supported ${chainId}.`)
    }

    private async queryWhiteList(handler: string) {
        const response = await fetch(urlcat(FUNDER_ROOT, '/whitelist', { twitterHandler: handler }))
        const json: FunderAPI.WhiteList = await response.json()
        return json
    }

    private async queryOperations(key: FunderAPI.ScanKey, value: string) {
        const response = await fetch(urlcat(FUNDER_ROOT, '/operation', { scanKey: key, scanValue: value }))
        const json: FunderAPI.Operation[] = await response.json()
        return json
    }

    getSupportedChainIds(): Promise<ChainId[]> {
        return Promise.resolve([ChainId.Matic, ChainId.Mumbai])
    }

    async fund(chainId: ChainId, proof: FunderAPI.Proof): Promise<FunderAPI.Fund> {
        await this.assetChainId(chainId)

        const response = await fetch(urlcat(FUNDER_ROOT, '/verify'), {
            method: 'POST',
            body: JSON.stringify(proof),
            headers: { 'Content-Type': 'application/json' },
        })
        const json = await response.json()
        return json.message as FunderAPI.Fund
    }

    async verify(handler: string) {
        try {
            const result = await this.queryWhiteList(handler)
            if (result.twitterHandler === handler && result.totalCount > 0) {
                return true
            }
            return false
        } catch {
            return false
        }
    }

    async queryRemainFrequency(handler: string) {
        try {
            const result = await this.queryWhiteList(handler)
            if (!result.totalCount || result.twitterHandler !== handler) return 0
            return result.totalCount - result.usedCount
        } catch {
            return 0
        }
    }

    async queryOperationByOwner(owner: string) {
        try {
            return this.queryOperations(FunderAPI.ScanKey.OwnerAddress, owner)
        } catch {
            return EMPTY_LIST
        }
    }
}

export class SmartPayAccountAPI implements ContractAccountAPI.Provider<NetworkPluginID.PLUGIN_EVM> {
    private web3 = new Web3API()
    private multicall = new MulticallAPI()
    private bundler = new SmartPayBundlerAPI()
    private fund = new SmartPayFunderAPI()
    private async getEntryPoint(chainId: ChainId) {
        const entryPoints = await this.bundler.getSupportedEntryPoints(chainId)
        return first(entryPoints)
    }

    private createWeb3(chainId: ChainId) {
        return this.web3.createSDK(chainId)
    }

    private createWalletContract(chainId: ChainId, address: string) {
        return createContract<Wallet>(this.createWeb3(chainId), address, WalletABI as AbiItem[])
    }

    private createContractAccount(
        chainId: ChainId,
        address: string,
        owner: string,
        nonce: number,
        deployed = true,
        funded = false,
    ): ContractAccountAPI.ContractAccount<NetworkPluginID.PLUGIN_EVM> {
        return {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            chainId,
            id: `${NetworkPluginID.PLUGIN_EVM}_${chainId}_${address}`,
            address,
            owner,
            deployed,
            funded,
            nonce,
        }
    }

    /**
     * Use the multicall contract to filter non-owned accounts out.
     * @param chainId
     * @param options
     * @returns
     */
    private async getOwnedAccountsFromMulticall(chainId: ChainId, owner: string, options: string[]) {
        const contracts = options.map((x) => this.createWalletContract(chainId, x)!)
        const names = Array.from<'owner'>({ length: options.length }).fill('owner')
        const calls = this.multicall.createMultipleContractSingleData(contracts, names, [])
        const operations = await this.fund.queryOperationByOwner(owner)
        const results = await this.multicall.call(chainId, contracts, names, calls)
        const accounts = results.flatMap((x) => (x.succeed && x.value ? x.value : []))

        // if the owner didn't derive any account before, then use the first account.
        if (!accounts.length && !operations.length)
            return options.slice(0, 1).map((x) => this.createContractAccount(chainId, x, owner, 0, false))

        // if the owner didn't derive any account before, but there are funded operation records
        if (operations.length && !accounts.length) {
            return options.map((x, index) => {
                const operation = operations.find((y) => isSameAddress(y.walletAddress, x))

                return this.createContractAccount(chainId, x, owner, operation?.nonce ?? index, false, !!operation)
            })
        }

        return accounts.map((x, index) =>
            this.createContractAccount(
                chainId,
                x,
                owner,
                index,
                true,
                operations.some((operation) => isSameAddress(operation.walletAddress, x)),
            ),
        )
    }

    /**
     * Query the on-chain changeOwner event from chainbase.
     * @param chainId
     * @param owner
     * @returns
     */
    private async getOwnedAccountsFromChainbase(chainId: ChainId, owner: string) {
        // TODO: impl chainbase query
        return []
    }

    private async getOwnedAccounts(
        chainId: ChainId,
        owner: string,
    ): Promise<Array<ContractAccountAPI.ContractAccount<NetworkPluginID.PLUGIN_EVM>>> {
        const entryPoint = await this.getEntryPoint(chainId)
        if (!entryPoint) throw new Error('No entry point contract.')

        const { LOGIC_WALLET_CONTRACT_ADDRESS, CREATE2_FACTORY_CONTRACT_ADDRESS } = getSmartPayConstants(chainId)
        if (!LOGIC_WALLET_CONTRACT_ADDRESS) throw new Error('No logic wallet contract.')
        if (!CREATE2_FACTORY_CONTRACT_ADDRESS) throw new Error('No create2 contract.')

        const contractWallet = new ContractWallet(owner, LOGIC_WALLET_CONTRACT_ADDRESS, entryPoint, chainId)
        const create2Factory = new Create2Factory(CREATE2_FACTORY_CONTRACT_ADDRESS)

        if (!contractWallet.initCode) throw new Error('Failed to create initCode.')

        const allSettled = await Promise.allSettled([
            this.getOwnedAccountsFromMulticall(
                chainId,
                owner,
                create2Factory.derive(contractWallet.initCode, MAX_ACCOUNT_LENGTH),
            ),
            this.getOwnedAccountsFromChainbase(chainId, owner),
        ])
        return allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
    }

    async getAccounts(
        chainId: ChainId,
        owners: string[],
    ): Promise<Array<ContractAccountAPI.ContractAccount<NetworkPluginID.PLUGIN_EVM>>> {
        const allSettled = await Promise.allSettled(owners.map((x) => this.getOwnedAccounts(chainId, x)))
        return allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
    }
}
