/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from 'bn.js'
import { ContractOptions } from 'web3-eth-contract'
import { EventLog } from 'web3-core'
import { EventEmitter } from 'events'
import {
    Callback,
    PayableTransactionObject,
    NonPayableTransactionObject,
    BlockType,
    ContractEventLog,
    BaseContract,
} from './types.js'

interface EventOptions {
    filter?: object
    fromBlock?: BlockType
    topics?: string[]
}

export interface RouterV2 extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): RouterV2
    clone(): RouterV2
    methods: {
        WETH(): NonPayableTransactionObject<string>

        addLiquidity(
            tokenA: string,
            tokenB: string,
            amountADesired: number | string | BN,
            amountBDesired: number | string | BN,
            amountAMin: number | string | BN,
            amountBMin: number | string | BN,
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<{
            amountA: string
            amountB: string
            liquidity: string
            0: string
            1: string
            2: string
        }>

        addLiquidityETH(
            token: string,
            amountTokenDesired: number | string | BN,
            amountTokenMin: number | string | BN,
            amountETHMin: number | string | BN,
            to: string,
            deadline: number | string | BN,
        ): PayableTransactionObject<{
            amountToken: string
            amountETH: string
            liquidity: string
            0: string
            1: string
            2: string
        }>

        factory(): NonPayableTransactionObject<string>

        getAmountIn(
            amountOut: number | string | BN,
            reserveIn: number | string | BN,
            reserveOut: number | string | BN,
        ): NonPayableTransactionObject<string>

        getAmountOut(
            amountIn: number | string | BN,
            reserveIn: number | string | BN,
            reserveOut: number | string | BN,
        ): NonPayableTransactionObject<string>

        getAmountsIn(amountOut: number | string | BN, path: string[]): NonPayableTransactionObject<string[]>

        getAmountsOut(amountIn: number | string | BN, path: string[]): NonPayableTransactionObject<string[]>

        quote(
            amountA: number | string | BN,
            reserveA: number | string | BN,
            reserveB: number | string | BN,
        ): NonPayableTransactionObject<string>

        removeLiquidity(
            tokenA: string,
            tokenB: string,
            liquidity: number | string | BN,
            amountAMin: number | string | BN,
            amountBMin: number | string | BN,
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<{
            amountA: string
            amountB: string
            0: string
            1: string
        }>

        removeLiquidityETH(
            token: string,
            liquidity: number | string | BN,
            amountTokenMin: number | string | BN,
            amountETHMin: number | string | BN,
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<{
            amountToken: string
            amountETH: string
            0: string
            1: string
        }>

        removeLiquidityETHSupportingFeeOnTransferTokens(
            token: string,
            liquidity: number | string | BN,
            amountTokenMin: number | string | BN,
            amountETHMin: number | string | BN,
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<string>

        removeLiquidityETHWithPermit(
            token: string,
            liquidity: number | string | BN,
            amountTokenMin: number | string | BN,
            amountETHMin: number | string | BN,
            to: string,
            deadline: number | string | BN,
            approveMax: boolean,
            v: number | string | BN,
            r: string | number[],
            s: string | number[],
        ): NonPayableTransactionObject<{
            amountToken: string
            amountETH: string
            0: string
            1: string
        }>

        removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
            token: string,
            liquidity: number | string | BN,
            amountTokenMin: number | string | BN,
            amountETHMin: number | string | BN,
            to: string,
            deadline: number | string | BN,
            approveMax: boolean,
            v: number | string | BN,
            r: string | number[],
            s: string | number[],
        ): NonPayableTransactionObject<string>

        removeLiquidityWithPermit(
            tokenA: string,
            tokenB: string,
            liquidity: number | string | BN,
            amountAMin: number | string | BN,
            amountBMin: number | string | BN,
            to: string,
            deadline: number | string | BN,
            approveMax: boolean,
            v: number | string | BN,
            r: string | number[],
            s: string | number[],
        ): NonPayableTransactionObject<{
            amountA: string
            amountB: string
            0: string
            1: string
        }>

        swapETHForExactTokens(
            amountOut: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): PayableTransactionObject<string[]>

        swapExactETHForTokens(
            amountOutMin: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): PayableTransactionObject<string[]>

        swapExactETHForTokensSupportingFeeOnTransferTokens(
            amountOutMin: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): PayableTransactionObject<void>

        swapExactTokensForETH(
            amountIn: number | string | BN,
            amountOutMin: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<string[]>

        swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn: number | string | BN,
            amountOutMin: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<void>

        swapExactTokensForTokens(
            amountIn: number | string | BN,
            amountOutMin: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<string[]>

        swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amountIn: number | string | BN,
            amountOutMin: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<void>

        swapTokensForExactETH(
            amountOut: number | string | BN,
            amountInMax: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<string[]>

        swapTokensForExactTokens(
            amountOut: number | string | BN,
            amountInMax: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<string[]>

        swapAVAXForExactTokens(
            amountOut: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): PayableTransactionObject<string[]>

        swapExactAVAXForTokensSupportingFeeOnTransferTokens(
            amountOutMin: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): PayableTransactionObject<void>

        swapExactTokensForAVAX(
            amountIn: number | string | BN,
            amountOutMin: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<string[]>

        swapExactTokensForAVAXSupportingFeeOnTransferTokens(
            amountIn: number | string | BN,
            amountOutMin: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<void>

        swapTokensForExactAVAX(
            amountOut: number | string | BN,
            amountInMax: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): NonPayableTransactionObject<string[]>

        swapExactAVAXForTokens(
            amountOutMin: number | string | BN,
            path: string[],
            to: string,
            deadline: number | string | BN,
        ): PayableTransactionObject<string[]>

        WAVAX(): NonPayableTransactionObject<string>
    }
    events: {
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }
}
