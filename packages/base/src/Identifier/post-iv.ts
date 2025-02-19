import { decodeArrayBuffer } from '@masknet/kit'
import { type Option, None } from 'ts-results-es'
import { Identifier } from './base.js'
import { banSlash } from './utils.js'

const instance = new WeakSet()
const id: Record<string, Record<string, PostIVIdentifier>> = Object.create(null)
export class PostIVIdentifier extends Identifier {
    static override from(input: string | null | undefined): Option<PostIVIdentifier> {
        if (!input) return None
        input = String(input)
        if (input.startsWith('post_iv:')) return Identifier.from(input) as Option<PostIVIdentifier>
        return None
    }
    declare readonly network: string
    declare readonly postIV: string
    constructor(network: string, postIV: string) {
        network = String(network)
        postIV = String(postIV)

        const networkCache = (id[network] ??= {})
        if (networkCache[postIV]) return networkCache[postIV]

        banSlash(network)
        super()
        this.network = network
        this.postIV = postIV
        Object.freeze(this)
        networkCache[postIV] = this
        instance.add(this)
    }
    toText() {
        return `post_iv:${this.network}/${this.postIV.replace(/\//g, '|')}`
    }
    toIV() {
        const x = this.postIV.replace(/\|/g, '/')
        return new Uint8Array(decodeArrayBuffer(x))
    }
    declare [Symbol.toStringTag]: string
    static [Symbol.hasInstance](x: any): boolean {
        return instance.has(x)
    }
}
PostIVIdentifier.prototype[Symbol.toStringTag] = 'PostIVIdentifier'
Object.freeze(PostIVIdentifier.prototype)
Object.freeze(PostIVIdentifier)
