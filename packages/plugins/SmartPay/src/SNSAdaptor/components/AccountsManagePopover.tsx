import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { memo, useMemo } from 'react'
import { Box, Button, Popover, Typography } from '@mui/material'
import { useI18N } from '../../locales/i18n_generated.js'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'

import { isSameAddress } from '@masknet/web3-shared-base'
import { useManagers } from '../../hooks/useManagers.js'
import { formatPersonaFingerprint } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(3),
        background: theme.palette.maskColor.bottom,
        width: 320,
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '20px',
        textAlign: 'center',
    },
    second: {
        fontSIze: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    name: {
        fontSIze: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
    },
}))

export interface AccountsManagePopoverProps {
    open: boolean
    anchorEl: HTMLElement | null
    onClose: () => void
    address?: string
    owner?: string
}

export const AccountsManagerPopover = memo<AccountsManagePopoverProps>(
    ({ open, anchorEl, onClose, address, owner }) => {
        const t = useI18N()
        const { classes } = useStyles()
        const { personaManagers, walletManagers } = useManagers()

        const ownerInfo = useMemo(() => {
            const persona = personaManagers?.find((x) => isSameAddress(x.address, owner))

            if (persona)
                return {
                    name: persona.nickname,
                    publicKey: formatPersonaFingerprint(persona.identifier.rawPublicKey, 4),
                }

            const wallet = walletManagers?.find((x) => isSameAddress(x.address, owner))
            if (!wallet) return
            return {
                name: wallet.name,
                publicKey: formatEthereumAddress(wallet.address, 4),
            }
        }, [owner, personaManagers, walletManagers])

        return usePortalShadowRoot((container) => (
            <Popover
                container={container}
                open={open}
                onClose={onClose}
                anchorEl={anchorEl}
                disableRestoreFocus
                classes={{ paper: classes.paper }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>
                <Typography className={classes.title}>{t.managed_accounts()}</Typography>
                <Box mt={1.5}>
                    <Typography className={classes.name}>Smart Pay1</Typography>
                    <Typography className={classes.second}>{formatEthereumAddress(address ?? '', 4)}</Typography>
                </Box>
                <Typography className={classes.second} my={1.5}>
                    {t.current_manage_account()}
                </Typography>
                <Box component="div" display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography className={classes.name}>{ownerInfo?.name}</Typography>
                        <Typography className={classes.second}>{ownerInfo?.publicKey}</Typography>
                    </Box>
                    <Button variant="roundedContained">{t.change_owner()}</Button>
                </Box>
            </Popover>
        ))
    },
)
