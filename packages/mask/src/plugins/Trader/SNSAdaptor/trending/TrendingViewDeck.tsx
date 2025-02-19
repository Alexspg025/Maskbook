import { Icons } from '@masknet/icons'
import { useActivatedPluginsSNSAdaptor, useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SourceType, formatCurrency, TokenType } from '@masknet/web3-shared-base'
import { FormattedCurrency, Linking, TokenSecurityBar, useTokenSecurity } from '@masknet/shared'
import { PluginID, NetworkPluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, MaskColors, MaskLightTheme, MaskDarkTheme } from '@masknet/theme'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { ChainId } from '@masknet/web3-shared-evm'
import {
    Avatar,
    Button,
    CardContent,
    IconButton,
    Paper,
    Stack,
    ThemeProvider,
    Typography,
    useTheme,
} from '@mui/material'
import { first, last } from 'lodash-es'
import { useCallback, useRef, useState, useContext } from 'react'
import { useI18N } from '../../../../utils/index.js'
import { useTransakAllowanceCoin } from '../../../Transak/hooks/useTransakAllowanceCoin.js'
import { PluginTransakMessages } from '../../../Transak/messages.js'
import type { Currency, Stat } from '../../types/index.js'
import { useTrendingOverview } from '../../trending/useTrending.js'
import { CoinMenu } from './CoinMenu.js'
import { TrendingViewContext } from './context.js'
import { CoinIcon } from './components/index.js'
import { PriceChanged } from './PriceChanged.js'
import { TrendingCard, TrendingCardProps } from './TrendingCard.js'
import { TrendingViewDescriptor } from './TrendingViewDescriptor.js'

const useStyles = makeStyles<{
    isTokenTagPopper: boolean
    isNFTProjectPopper: boolean
}>()((theme, props) => {
    return {
        content: {
            paddingTop: 0,
            paddingBottom: '0 !important',
            '&:last-child': {
                padding: 0,
            },
        },
        cardHeader: {
            padding: theme.spacing(2),
            paddingBottom: theme.spacing(6.5),
            background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
        },
        headline: {
            marginTop: props.isNFTProjectPopper || props.isTokenTagPopper ? 0 : 30,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            position: 'relative',
        },
        title: {
            display: 'flex',
            maxWidth: 350,
            alignItems: 'center',
            whiteSpace: 'nowrap',
        },
        name: {
            maxWidth: 200,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            fontSize: 18,
            fontWeight: 700,
            color: theme.palette.maskColor?.dark,
        },
        symbol: {
            fontWeight: 700,
            fontSize: 18,
            color: theme.palette.maskColor.dark,
            marginLeft: theme.spacing(0.5),
            marginRight: theme.spacing(0.5),
            display: 'flex',
            alignItems: 'center',
        },
        symbolText: {
            display: 'inline-block',
            maxWidth: 200,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            fontStyle: 'normal',
            overflow: 'hidden',
            textTransform: 'uppercase',
        },
        rank: {
            display: 'inline-flex',
            padding: theme.spacing(0.25, 0.5),
            color: theme.palette.maskColor?.white,
            fontWeight: 400,
            fontSize: 10,
            background: theme.palette.maskColor?.dark,
            borderRadius: theme.spacing(0.5),
        },
        avatar: {
            width: 24,
            height: 24,
            fontSize: 10,
            backgroundColor: theme.palette.common.white,
        },
        buyButton: {
            marginLeft: 'auto',
        },
        icon: {
            color: MaskColors.dark.maskColor.dark,
        },
        pluginDescriptorWrapper: {
            padding: '15px 17px 15px 13px',
            position: 'absolute',
            width: '100%',
            height: 48,
            left: 0,
            bottom: 12,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(5px)',
            boxSizing: 'border-box',
            borderBottomRightRadius: '16px',
            borderBottomLeftRadius: '16px',
            zIndex: 2,
        },
    }
})

export interface TrendingViewDeckProps extends withClasses<'header' | 'body' | 'footer' | 'content' | 'cardHeader'> {
    stats: Stat[]
    currency: Currency
    trending: TrendingAPI.Trending
    setResult: (a: Web3Helper.TokenResultAll) => void
    result: Web3Helper.TokenResultAll
    resultList?: Web3Helper.TokenResultAll[]
    children?: React.ReactNode
    TrendingCardProps?: Partial<TrendingCardProps>
}

export function TrendingViewDeck(props: TrendingViewDeckProps) {
    const { trending, stats, children, TrendingCardProps, resultList = [], result, setResult } = props

    const { coin, market } = trending
    const { isNFTProjectPopper, isTokenTagPopper, isPreciseSearch } = useContext(TrendingViewContext)
    const { value: overview } = useTrendingOverview(props.trending.coin.address ?? '', props.trending.coin.chainId)

    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles({ isTokenTagPopper, isNFTProjectPopper }, { props })
    const isNFT = coin.type === TokenType.NonFungible

    // #region buy
    const transakPluginEnabled = useActivatedPluginsSNSAdaptor('any').some((x) => x.ID === PluginID.Transak)
    const transakIsMinimalMode = useIsMinimalMode(PluginID.Transak)

    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isAllowanceCoin = useTransakAllowanceCoin({ address: coin.contract_address, symbol: coin.symbol })
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

    const snsAdaptorMinimalPlugins = useActivatedPluginsSNSAdaptor(true)
    const isTokenSecurityEnable = !isNFT && !snsAdaptorMinimalPlugins.map((x) => x.ID).includes(PluginID.GoPlusSecurity)

    const { value: tokenSecurityInfo, error } = useTokenSecurity(
        coin.chainId ?? ChainId.Mainnet,
        coin.contract_address?.trim(),
        isTokenSecurityEnable,
    )

    const isBuyable = !isNFT && transakPluginEnabled && !transakIsMinimalMode && coin.symbol && isAllowanceCoin
    const onBuyButtonClicked = useCallback(() => {
        setBuyDialog({
            open: true,
            code: coin.symbol,
            address: account,
        })
    }, [account, coin.symbol])
    // #endregion

    const titleRef = useRef<HTMLElement>(null)
    const [coinMenuOpen, setCoinMenuOpen] = useState(false)
    const coinAddress = coin.address || coin.contract_address

    return (
        <TrendingCard {...TrendingCardProps}>
            <Stack className={classes.cardHeader}>
                {isNFTProjectPopper || isTokenTagPopper ? null : (
                    <TrendingViewDescriptor result={result} resultList={resultList} setResult={setResult} />
                )}
                <Stack className={classes.headline}>
                    <Stack gap={2} flexGrow={1}>
                        <Stack>
                            <Stack flexDirection="row" alignItems="center" gap={0.5} ref={titleRef}>
                                {coinAddress ? (
                                    <Linking href={first(coin.home_urls)}>
                                        <Avatar className={classes.avatar} src={coin.image_url} alt={coin.symbol}>
                                            <CoinIcon
                                                type={coin.type}
                                                name={coin.name}
                                                label=""
                                                symbol={coin.symbol}
                                                address={coinAddress}
                                                logoURL={coin.image_url}
                                                size={20}
                                            />
                                        </Avatar>
                                    </Linking>
                                ) : null}

                                <Typography className={classes.title} variant="h6">
                                    <Linking
                                        href={first(coin.home_urls)}
                                        LinkProps={{ className: classes.name, title: coin.name.toUpperCase() }}>
                                        {coin.name.toUpperCase()}
                                    </Linking>
                                    {coin.symbol ? (
                                        <Typography component="span" className={classes.symbol}>
                                            (<em className={classes.symbolText}>{coin.symbol}</em>)
                                        </Typography>
                                    ) : null}
                                </Typography>
                                {typeof coin.market_cap_rank === 'number' || result.rank ? (
                                    <Typography component="span" className={classes.rank} title="Index Cap Rank">
                                        {t('plugin_trader_rank', { rank: result.rank ?? coin.market_cap_rank })}
                                    </Typography>
                                ) : null}
                                {resultList.length > 1 && !isPreciseSearch && result.rank ? (
                                    <>
                                        <IconButton
                                            sx={{ padding: 0 }}
                                            size="small"
                                            onClick={() => setCoinMenuOpen((v) => !v)}>
                                            <Icons.ArrowDrop size={24} className={classes.icon} />
                                        </IconButton>
                                        <ThemeProvider
                                            theme={theme.palette.mode === 'light' ? MaskLightTheme : MaskDarkTheme}>
                                            <CoinMenu
                                                open={coinMenuOpen}
                                                anchorEl={titleRef.current}
                                                optionList={resultList}
                                                result={result}
                                                onChange={setResult}
                                                onClose={() => setCoinMenuOpen(false)}
                                            />
                                        </ThemeProvider>
                                    </>
                                ) : null}
                                <ThemeProvider theme={MaskLightTheme}>
                                    {isBuyable ? (
                                        <Button
                                            color="primary"
                                            className={classes.buyButton}
                                            size="small"
                                            startIcon={<Icons.Buy size={16} />}
                                            variant="contained"
                                            onClick={onBuyButtonClicked}>
                                            {t('buy_now')}
                                        </Button>
                                    ) : null}
                                    {isNFT ? (
                                        <Button
                                            color="primary"
                                            className={classes.buyButton}
                                            size="small"
                                            endIcon={<Icons.LinkOut size={16} />}
                                            variant="roundedContained"
                                            onClick={() => window.open(first(coin.home_urls))}>
                                            {t('open')}
                                        </Button>
                                    ) : null}
                                </ThemeProvider>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" marginTop={2}>
                                <Stack direction="row" gap={1} alignItems="center">
                                    {market ? (
                                        <Typography
                                            fontSize={18}
                                            fontWeight={500}
                                            lineHeight="24px"
                                            color={theme.palette.maskColor.dark}>
                                            {isNFT ? `${t('plugin_trader_floor_price')}: ` : null}
                                            <FormattedCurrency
                                                value={
                                                    (trending.dataProvider === SourceType.CoinMarketCap
                                                        ? last(stats)?.[1] ?? market.current_price
                                                        : market.current_price) ?? 0
                                                }
                                                sign={isNFT ? market.price_symbol ?? 'ETH' : 'USD'}
                                                formatter={formatCurrency}
                                            />
                                        </Typography>
                                    ) : (
                                        <Typography fontSize={14} fontWeight={500} lineHeight="24px">
                                            {t('plugin_trader_no_data')}
                                        </Typography>
                                    )}
                                    <PriceChanged
                                        amount={
                                            market?.price_change_percentage_1h ??
                                            market?.price_change_percentage_24h ??
                                            overview?.average_price_change_1d
                                                ? Number.parseFloat(overview?.average_price_change_1d ?? '0')
                                                : 0
                                        }
                                    />
                                </Stack>
                                {isTokenSecurityEnable && tokenSecurityInfo && !error && !isNFT && (
                                    <TokenSecurityBar tokenSecurity={tokenSecurityInfo} />
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
            <CardContent className={classes.content}>
                <Paper className={classes.body} elevation={0}>
                    {children}
                </Paper>
                {isNFTProjectPopper || isTokenTagPopper ? (
                    <section className={classes.pluginDescriptorWrapper}>
                        <TrendingViewDescriptor result={result} resultList={resultList} setResult={setResult} />
                    </section>
                ) : null}
            </CardContent>
        </TrendingCard>
    )
}
