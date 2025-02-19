import { useCallback } from 'react'
import { socialNetworkEncoder } from '@masknet/encryption'
import { PluginID, ProfileIdentifier } from '@masknet/shared-base'
import type { Meta } from '@masknet/typed-message'
import Services from '../../extension/service.js'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network/index.js'
import { isFacebook } from '../../social-network-adaptor/facebook.com/base.js'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base.js'
import { I18NFunction, useI18N } from '../../utils/index.js'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import { SteganographyPayload } from './SteganographyPayload.js'
import type { SubmitComposition } from './CompositionUI.js'

export function useSubmit(onClose: () => void, reason: 'timeline' | 'popup' | 'reply') {
    const { t } = useI18N()
    const lastRecognizedIdentity = useLastRecognizedIdentity()

    return useCallback(
        async (info: SubmitComposition) => {
            const { content, encode, target } = info
            const fallbackProfile: ProfileIdentifier | undefined = globalUIState.profiles.value[0]?.identifier
            if (encode === 'image' && !lastRecognizedIdentity) throw new Error('No Current Profile')

            const rawEncrypted = await Services.Crypto.encryptTo(
                info.version,
                content,
                target,
                lastRecognizedIdentity?.identifier ?? fallbackProfile,
                activatedSocialNetworkUI.encryptionNetwork,
            )

            if (encode === 'image') {
                let encrypted: string | Uint8Array

                if (typeof rawEncrypted === 'string')
                    encrypted = socialNetworkEncoder(activatedSocialNetworkUI.encryptionNetwork, rawEncrypted)
                else encrypted = rawEncrypted

                const decoratedText = decorateEncryptedText('', t, content.meta)
                const defaultText = t('additional_post_box__steganography_post_pre', {
                    random: new Date().toLocaleString(),
                })
                await pasteImage(decoratedText || defaultText, encrypted, reason)
            } else {
                const encrypted = socialNetworkEncoder(activatedSocialNetworkUI.encryptionNetwork, rawEncrypted)
                const decoratedText = decorateEncryptedText(encrypted, t, content.meta)
                pasteTextEncode(decoratedText ?? t('additional_post_box__encrypted_post_pre', { encrypted }), reason)
            }
            onClose()
        },
        [t, lastRecognizedIdentity, onClose, reason],
    )
}

function pasteTextEncode(text: string, reason: 'timeline' | 'popup' | 'reply') {
    activatedSocialNetworkUI.automation.nativeCompositionDialog?.appendText?.(text, {
        recover: true,
        reason,
    })
}
async function pasteImage(
    relatedTextPayload: string,
    encrypted: string | Uint8Array,
    reason: 'timeline' | 'popup' | 'reply',
) {
    const img = await SteganographyPayload(encrypted)
    // Don't await this, otherwise the dialog won't disappear
    activatedSocialNetworkUI.automation.nativeCompositionDialog!.attachImage!(img, {
        recover: true,
        relatedTextPayload,
        reason,
    })
}

// TODO: Provide API to plugin to post-process post content,
// then we can move these -PreText's and meta readers into plugin's own context
function decorateEncryptedText(encrypted: string, t: I18NFunction, meta?: Meta): string | null {
    const hasOfficialAccount = isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
    const officialAccount = isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account')

    // Note: since this is in the composition stage, we can assume plugins don't insert old version of meta.
    if (meta?.has(`${PluginID.RedPacket}:1`) || meta?.has(`${PluginID.RedPacket}_nft:1`)) {
        return hasOfficialAccount
            ? t('additional_post_box__encrypted_post_pre_red_packet_twitter_official_account', {
                  encrypted,
                  account: officialAccount,
              })
            : t('additional_post_box__encrypted_post_pre_red_packet', { encrypted })
    } else if (meta?.has(`${PluginID.ITO}:2`)) {
        return hasOfficialAccount
            ? t('additional_post_box__encrypted_post_pre_ito_twitter_official_account', {
                  encrypted,
                  account: officialAccount,
              })
            : t('additional_post_box__encrypted_post_pre_ito', { encrypted })
    } else if (meta?.has(`${PluginID.FileService}:2`)) {
        return hasOfficialAccount
            ? t('additional_post_box__encrypted_post_pre_file_service_twitter_official_account', {
                  encrypted,
                  account: officialAccount,
              })
            : t('additional_post_box__encrypted_post_pre_file_service', { encrypted })
    }
    return null
}
