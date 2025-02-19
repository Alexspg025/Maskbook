import { LoadingBase, makeStyles } from '@masknet/theme'
import { Link, Stack, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useMemo } from 'react'
import { useSharedI18N } from '../../../locales/index.js'
import { xmasBackground } from '../../../constants.js'

const useStyles = makeStyles()((theme) => ({
    title: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), url(${xmasBackground})`,
        backgroundColor: 'white',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        minHeight: '196px',
        justifyContent: 'space-between',
    },
    web3Icon: {
        marginRight: 6,
        marginTop: 2,
    },
    item1: {
        color: theme.palette.maskColor.secondaryDark,
        fontSize: '14px',
        fontWeight: 400,
    },
    item2: {
        color: theme.palette.maskColor.dark,
        fontSize: '14px',
        fontWeight: 500,
        marginLeft: '2px',
    },
    linkOutIcon: {
        color: theme.palette.maskColor.secondaryDark,
    },
}))

export interface PluginCardFrameMiniProps {
    name?: React.ReactNode
    provider?: React.ReactNode
    providerLink?: string
    children?: React.ReactNode
}

export const PluginCardFrameMini = ({ name, provider, providerLink, children }: PluginCardFrameMiniProps) => {
    const t = useSharedI18N()
    const { classes } = useStyles()

    const defaultPluginName = useMemo(() => {
        return (
            <Stack className={classes.title} direction="row">
                <Icons.Web3Profile className={classes.web3Icon} />
                <Typography fontSize={16} fontWeight={700}>
                    {t.plugin_card_frame_default_title()}
                </Typography>
            </Stack>
        )
    }, [])

    return (
        <Stack className={classes.container}>
            <Stack direction="row" justifyContent="space-between" p={1.5}>
                {name ?? defaultPluginName}
                <Stack direction="row" gap={0.5}>
                    <Typography className={classes.item1}>{t.plugin_card_frame_default_provided_by()}</Typography>
                    <Typography className={classes.item2}>
                        {provider ?? t.plugin_card_frame_default_provided_by_value()}
                    </Typography>
                    <Link
                        underline="none"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="textPrimary"
                        href={providerLink ?? 'https://mask.io/'}
                        width="22px"
                        height="22px"
                        style={{ alignSelf: 'center', marginLeft: '4px' }}>
                        <Icons.LinkOut size={16} className={classes.linkOutIcon} />
                    </Link>
                </Stack>
            </Stack>
            <Stack flex={1} justifyContent="center" alignItems="center" p={1.5}>
                {children ?? (
                    <Stack gap={0.5} justifyContent="center" alignItems="center">
                        <LoadingBase />
                        <Typography
                            fontSize={14}
                            fontWeight={400}
                            lineHeight="18px"
                            color={(t) => t.palette.maskColor.publicMain}>
                            {t.plugin_card_frame_loading()}
                        </Typography>
                    </Stack>
                )}
            </Stack>
        </Stack>
    )
}
