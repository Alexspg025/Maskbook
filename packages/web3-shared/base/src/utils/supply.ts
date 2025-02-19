import { BigNumber } from 'bignumber.js'

const boundaryValues = {
    mid: 10000000000,
}

/**
 * format Total supply
 *
 * 1. The number is expressed as a normal number within 1,000,000. i.e. 585,242
 * 2. Above 1,000,000 is expressed in scientific notation, retaining two decimal places. For example, 52,488,984,654, 5.25E+10
 * 3. Retain 2 decimal places. When the decimal point is XX.00, keep 1 zero
 *
 * @returns format result
 * @param value
 */
export function formatSupply(value: BigNumber.Value | null | undefined, fallback?: string | number) {
    if (value === undefined || value === null) return fallback
    const bgValue = new BigNumber(value)
    const isGreaterThanOrEqualToMin = bgValue.isGreaterThanOrEqualTo(boundaryValues.mid)

    const integerValue = bgValue.integerValue(1)
    const decimalValue = bgValue.plus(integerValue.negated()).toFixed(2)
    const finalValue = integerValue.plus(decimalValue)

    if (isGreaterThanOrEqualToMin) return finalValue.toExponential(2)
    return finalValue.toFormat(finalValue.isInteger() ? 0 : 2, 0)
}
