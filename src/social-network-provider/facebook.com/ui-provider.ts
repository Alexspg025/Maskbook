import { defineSocialNetworkUI } from '../../social-network/ui'
import { ValueRef } from '@holoflows/kit/es'
import { InitFriendsValueRef } from '../../social-network/defaults/FriendsValueRef'

defineSocialNetworkUI({
    name: 'Facebook',
    init(env, pref) {
        InitFriendsValueRef(this, 'facebook.com')
    },
    shouldActivate() {
        return location.hostname.endsWith('facebook.com')
    },
    friendsRef: new ValueRef([]),
})
